# Auth Service

Node.js microservice for authentication and user management. Records login events to MongoDB after successful Firebase/Google sign-in.

## Setup

1. Install dependencies:
   ```bash
   cd backend/services/auth-service && npm install
   ```

2. Ensure MongoDB is running on `localhost:27017` (or set `MONGODB_URI`).

3. Start the service:
   ```bash
   npm run dev
   ```

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5001` | HTTP server port |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed origin(s). Comma-separated for multiple (e.g. `http://localhost:3000,https://app.example.com`). |
| `MONGODB_URI` | `mongodb://localhost:27017/prompt-library` | MongoDB connection string |
| `GOOGLE_APPLICATION_CREDENTIALS` | — | Path to Firebase service account JSON file (e.g. `./googleServiceAccount.json`) or raw JSON string. Required for token verification. |

## API

- `POST /api/auth/record-login` — Records a user login (called by frontend after Firebase sign-in)
- `GET /api/auth/me` — Returns current user from MongoDB. Requires `Authorization: Bearer <firebase-id-token>`. If `FIREBASE_SERVICE_ACCOUNT_JSON` is not set, returns 503 and frontend falls back to Firebase user data.
- `GET /health` — Health check

## Frontend

Set `NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:5001` in the frontend `.env.local` to match this service (or whatever `PORT` you use).
