# Prompt Service

Records and serves prompt data for the Prompt Library. Manages user-created prompts with full CRUD operations.

## Setup

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```

2. Configure `.env`:
   - `MONGODB_URI` - MongoDB connection (default: `mongodb://localhost:27017/prompt-library`)
   - `GOOGLE_APPLICATION_CREDENTIALS` - Firebase service account for auth (path or JSON string)
   - `CORS_ORIGIN` - Allowed frontend origin(s)
   - `RABBITMQ_URL` and `RABBITMQ_EXCHANGE` - Optional domain event publishing for notifications

3. Install and run:
   ```bash
   npm install
   npm run dev
   ```

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/prompts` | No | List prompts. Query: `author`, `tags`, `q` (search), `limit`, `offset`, `sort` |
| GET | `/api/prompts/by-author/:username` | No | List prompts by author username |
| GET | `/api/prompts/:id` | No | Get single prompt (increments view count) |
| POST | `/api/prompts` | Yes | Create prompt |
| PATCH | `/api/prompts/:id` | Yes | Update prompt (owner only) |
| DELETE | `/api/prompts/:id` | Yes | Delete prompt (owner only) |

### Create/Update body

- `title` (required), `description`, `tags[]`
- `primaryPrompt` (required), `guide`, `parameters[]`, `variants[]`
- `authorUsername` (required on create) - must match authenticated user's username

### Auth

Protected routes require `Authorization: Bearer <firebase-id-token>`.

## Health

- `GET /health` - Returns `{ status: "ok", service: "prompt-service" }`
