# Backend

Microservices for the Prompt Library.

For full cross-service architecture and integration details, see `INTEGRATION_GUIDE.md` in the repository root.

## Services

### auth-service

Handles authentication and user records. Stores login data in MongoDB after each successful Firebase/Google sign-in.

```bash
cd services/auth-service && npm install && npm run dev
```

Requires MongoDB running on `localhost:27017`.
