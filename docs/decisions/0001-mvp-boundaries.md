# ADR 0001: MVP Boundaries and Provider Separation

- Status: Proposed
- Date: 2026-10-23
- Source: BRD sections 4, 6, 7, 13, 17, and 19

## Context

The product must provide useful English practice while prioritizing a possible Rp0 operating mode. The BRD explicitly warns that a DeepSeek LLM API does not automatically provide STT or TTS, and that free availability, quotas, pricing, retention, and licensing can change.

## Decision

1. The MVP uses push-to-talk, not full-duplex real-time voice.
2. LLM, STT, and TTS are separate typed provider capabilities behind a server boundary.
3. Provider selection is configuration-driven and replaceable without changing session, vocabulary, or progress domain logic.
4. Rp0 mode has a hard stop: it cannot silently fall back to a paid provider.
5. Raw audio is not persisted by default. Any opt-in storage requires consent, retention, and deletion behavior.
6. Confirmed user turns are persisted with idempotency keys before the client reports them as saved.

## Consequences

- The first voice implementation can be tested and shipped without committing to a full-duplex provider.
- The server must own secrets, provider calls, validation, quotas, usage logs, timeout/retry policy, and paid-fallback consent.
- STT/TTS selection remains an explicit blocker until compatibility, cost, quota, retention, licensing, and Android Expo behavior are verified.
- Full-duplex requires a later ADR after push-to-talk reliability, cost, and latency evidence exist.

## Rejected shortcuts

- Treating DeepSeek as an assumed STT/TTS provider.
- Putting provider secrets in the Expo app.
- Automatically switching to a paid provider when a free quota is exhausted.
- Marking an unsaved or locally optimistic message as persisted.

