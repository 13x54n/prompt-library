# Security

## Credentials

- **Never commit** `.env`, `googleServiceAccount.json`, or any file containing private keys.
- All such files are listed in `.gitignore`.
- If credentials were ever committed, **revoke and regenerate** them in [Firebase Console](https://console.firebase.google.com) → Project Settings → Service accounts.

## Auth Flow

- All protected endpoints require `Authorization: Bearer <firebase-id-token>`.
- Tokens are verified server-side via Firebase Admin SDK.
- `uid` and `email` are read from the verified token/Firebase user, never trusted from request body.
- No development fallbacks that bypass token verification (they would allow impersonation).
