# Backend

Microservices for the Prompt Library.

## Services

### auth-service

Handles authentication and user records. Stores login data in MongoDB after each successful Firebase/Google sign-in.

```bash
cd services/auth-service && npm install && npm run dev
```

Requires MongoDB running on `localhost:27017`.
