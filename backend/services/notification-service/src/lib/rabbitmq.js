import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL ?? "amqp://localhost:5672";
const EXCHANGE = process.env.RABBITMQ_EXCHANGE ?? "domain.events";
const QUEUE = process.env.RABBITMQ_QUEUE ?? "notifications.events";
const RETRY_QUEUE = process.env.RABBITMQ_RETRY_QUEUE ?? "notifications.events.retry";
const DLQ = process.env.RABBITMQ_DLQ ?? "notifications.events.dlq";
const ROUTING_KEY = process.env.RABBITMQ_ROUTING_KEY ?? "#";
const MAX_RETRIES = Math.max(Number(process.env.RABBITMQ_MAX_RETRIES ?? 5), 0);
const RETRY_DELAY_MS = Math.max(Number(process.env.RABBITMQ_RETRY_DELAY_MS ?? 5000), 100);

let connection = null;
let channel = null;
const RECONNECT_DELAY_MS = Math.max(Number(process.env.RABBITMQ_RECONNECT_DELAY_MS ?? 5000), 1000);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getChannel() {
  if (channel) return channel;
  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  connection.on("error", (err) => {
    console.error("[notification-service] RabbitMQ connection error:", err.message);
  });
  connection.on("close", () => {
    channel = null;
    connection = null;
  });

  await channel.assertExchange(EXCHANGE, "topic", { durable: true });
  await channel.assertExchange(`${EXCHANGE}.dlx`, "direct", { durable: true });

  await channel.assertQueue(DLQ, { durable: true });
  await channel.bindQueue(DLQ, `${EXCHANGE}.dlx`, DLQ);

  await channel.assertQueue(RETRY_QUEUE, {
    durable: true,
    deadLetterExchange: EXCHANGE,
    deadLetterRoutingKey: ROUTING_KEY === "#" ? "domain.retry" : ROUTING_KEY,
    messageTtl: RETRY_DELAY_MS,
  });

  await channel.assertQueue(QUEUE, {
    durable: true,
    deadLetterExchange: `${EXCHANGE}.dlx`,
    deadLetterRoutingKey: DLQ,
  });
  await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);
  await channel.bindQueue(QUEUE, EXCHANGE, "domain.retry");

  return channel;
}

export async function consumeDomainEvents(onEvent) {
  while (true) {
    try {
      const ch = await getChannel();
      await ch.prefetch(20);

      await ch.consume(QUEUE, async (msg) => {
        if (!msg) return;

        let event = null;
        try {
          event = JSON.parse(msg.content.toString("utf8"));
        } catch (err) {
          console.error("[notification-service] Invalid event JSON:", err.message);
          ch.nack(msg, false, false);
          return;
        }

        if (!event?.eventId || !event?.eventType || !event?.payload) {
          console.error("[notification-service] Invalid event shape:", event);
          ch.nack(msg, false, false);
          return;
        }

        try {
          await onEvent(event);
          ch.ack(msg);
        } catch (err) {
          const retryCount = Number(msg.properties.headers?.["x-retry-count"] ?? 0);
          const canRetry = retryCount < MAX_RETRIES && err?.transient === true;

          if (canRetry) {
            ch.sendToQueue(RETRY_QUEUE, msg.content, {
              contentType: "application/json",
              persistent: true,
              headers: {
                ...msg.properties.headers,
                "x-retry-count": retryCount + 1,
              },
            });
            ch.ack(msg);
            return;
          }

          console.error("[notification-service] Event processing failed:", err);
          ch.nack(msg, false, false);
        }
      });

      return;
    } catch (err) {
      console.error("[notification-service] RabbitMQ consumer setup failed:", err.message);
      connection = null;
      channel = null;
      await sleep(RECONNECT_DELAY_MS);
    }
  }
}
