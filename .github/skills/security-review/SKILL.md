---
name: security-review
description: "Use for security review of the Expo client, Supabase Auth/RLS, server provider boundary, secrets, input validation, tokens, privacy, and abuse/cost controls."
---

# Security Review

## Procedure

1. Enumerate trust boundaries, assets, actors, and data flows before reviewing code.
2. Check secret exposure, auth/session handling, authorization/RLS, input/output validation, injection, logging, transport, and dependency risk.
3. Verify quota/rate limiting and paid-provider consent protect both users and budget.
4. Reproduce high-confidence issues with focused tests or concrete code paths; do not speculate.
5. Report severity, file/line, impact, exploit preconditions, confidence, and surgical remediation.
6. Re-run focused tests after fixes and document residual risk.

## Required checks

DeepSeek/API keys must not be in client code or public env. Every user-owned row must be ownership-protected in the database, not only in UI code. Logs must not contain tokens, raw audio, or unnecessary sensitive transcripts.

