# ADR 0002: Open Implementation Decisions

- Status: Decisions captured; compatibility verification pending
- Date: 2026-10-23

These are explicit BRD decisions, not assumptions the coding agent may silently make.

| Decision | Recommended starting default | Evidence required before Phase 1/4 |
|---|---|---|
| Initial platforms | Android first, with iOS-compatible APIs where inexpensive | Confirm target support and device test budget |
| Voice interaction | Push-to-talk | Confirmed by BRD recommendation; full-duplex deferred |
| LLM provider | NVIDIA hosted OpenAI-compatible API with configurable model | Current API, selected model, free-tier quota, retention, licensing, rate limits |
| STT | Verified local/offline engine | English quality, mobile audio format, Expo/Android support, model size, device performance, licensing |
| TTS | Device engine | Voice quality, speed control, Expo/Android support, locale behavior, accessibility |
| Cost mode | Rp0 mode enabled by default; paid fallback requires explicit user consent | Explicit UI and server behavior when any component is unavailable |
| Audio retention | Off by default | Consent, retention period, storage/delete path, export semantics |
| Server boundary | Server-side API/edge function with secret management | Hosting, auth propagation, timeout/retry, observability, cost |
| Scheduler | SM-2 with documented parameters | Exact intervals, rating mapping, timezone edge cases, and deterministic tests |

Decisions captured from stakeholder:

- Android is the initial target.
- Rp0 mode is the default; paid fallback is never automatic and requires explicit consent.
- Raw audio is not stored by default.
- Spaced repetition uses SM-2.
- STT must be local/offline for MVP.
- TTS uses the device engine for MVP.
- NVIDIA hosted API is the selected LLM provider for the current implementation slice; the API key remains server-only.

The agent must stop and request a decision when implementation would materially change one of these defaults. The remaining work is technical verification, not permission to silently replace them.
