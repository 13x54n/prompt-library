# Notification Service

Stores and serves user notifications for Prompt Library. Consumes domain events from RabbitMQ and writes notifications to MongoDB.

## Setup

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```

2. Configure `.env`:
   - `MONGODB_URI` - MongoDB connection URI
   - `GOOGLE_APPLICATION_CREDENTIALS` - Firebase Admin credentials (path or raw JSON)
   - `RABBITMQ_URL` - RabbitMQ connection URI
   - `RABBITMQ_EXCHANGE` - exchange for domain events
   - `RABBITMQ_QUEUE` - notification consumer queue
   - `RABBITMQ_RETRY_QUEUE` - retry queue
   - `RABBITMQ_DLQ` - dead-letter queue

3. Install and run:
   ```bash
   npm install
   npm run dev
   ```

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications` | Yes | List notifications for current user (`limit`, `cursor`) |
| GET | `/api/notifications/unread-count` | Yes | Count unread notifications |
| POST | `/api/notifications/:id/read` | Yes | Mark one notification as read |
| POST | `/api/notifications/read-all` | Yes | Mark all current-user notifications as read |

## Health

- `GET /health` -> `{ status: "ok", service: "notification-service" }`
