# Security Runbook

## Credential Rotation (Immediate)

If any service account key is exposed:

1. Revoke the compromised key in Firebase/GCP IAM.
2. Generate a replacement key with least privilege.
3. Distribute the new key securely via environment/secret manager.
4. Do not commit JSON keys to the repository.

## Repository Secret Policy

- Never commit `.env` files or credential JSON files.
- CI runs a secret scan on every push and pull request.
- Credentials must be injected through environment variables or a managed secret store.
