---
name: ai-provider-integration
description: "Use for DeepSeek or compatible AI provider integration, provider adapters, streaming, timeouts, retries, validation, quotas, cost guards, and error handling."
---

# AI Provider Integration

## Procedure

1. Verify current provider API, pricing, quotas, data retention, model availability, and licensing from official sources.
2. Define a typed provider interface independent of screens and session persistence.
3. Keep credentials server-side; validate authenticated requests and bound input length/token budgets.
4. Implement bounded timeout, retry only for retryable failures, cancellation, and structured error mapping.
5. Treat streaming as incremental transport, not persistence: persist only confirmed complete turns with idempotency keys.
6. Enforce per-user quotas and cost guardrails before provider calls; require explicit consent for paid fallback.
7. Test success, malformed output, timeout, rate limit, provider outage, cancellation, quota exhaustion, and duplicate delivery.

## Guardrails

Never fabricate an AI response on provider failure. Never silently switch models/providers. Do not couple provider-specific response shapes to domain/UI code.

