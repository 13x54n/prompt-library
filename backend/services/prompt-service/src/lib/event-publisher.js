import amqp from "amqplib";
import { randomUUID } from "crypto";

const RABBITMQ_URL = process.env.RABBITMQ_URL ?? "amqp://localhost:5672";
const RABBITMQ_EXCHANGE = process.env.RABBITMQ_EXCHANGE ?? "domain.events";
const RECONNECT_DELAY_MS = Math.max(Number(process.env.RABBITMQ_RECONNECT_DELAY_MS ?? 3000), 1000);

let connection = null;
let channel = null;
let reconnecting = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getChannel() {
  if (channel) return channel;

  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createConfirmChannel();
    await channel.assertExchange(RABBITMQ_EXCHANGE, "topic", { durable: true });

    connection.on("error", (err) => {
      console.error("[prompt-service] RabbitMQ connection error:", err.message);
    });

    connection.on("close", () => {
      channel = null;
      connection = null;
      if (!reconnecting) {
        reconnecting = true;
        sleep(RECONNECT_DELAY_MS).finally(() => {
          reconnecting = false;
        });
      }
    });

    return channel;
  } catch (err) {
    console.error("[prompt-service] RabbitMQ unavailable. Will retry on next publish:", err.message);
    return null;
  }
}

export async function publishDomainEvent(eventType, payload) {
  const ch = await getChannel();
  if (!ch) return false;

  const event = buildDomainEvent(eventType, payload);

  try {
    const published = ch.publish(RABBITMQ_EXCHANGE, eventType, Buffer.from(JSON.stringify(event), "utf8"), {
      contentType: "application/json",
      persistent: true,
    });
    if (!published) {
      await sleep(10);
    }
    await ch.waitForConfirms();
    return true;
  } catch (err) {
    console.error("[prompt-service] Failed to publish event:", err.message);
    channel = null;
    connection = null;
    return false;
  }
}

export function buildDomainEvent(eventType, payload) {
  return {
    eventId: randomUUID(),
    eventType,
    occurredAt: new Date().toISOString(),
    payload,
  };
}
