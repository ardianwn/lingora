# BRD Traceability and Acceptance Baseline

Source of truth: [BRD AI English Voice Tutor](../BRD_AI_English_Voice_Tutor_React_Native.pdf), version 1.0, 23 October 2026.

This document turns the BRD into implementation gates. It is a planning artifact, not evidence that a feature has been implemented.

## Product boundary

### MVP

- Personal mobile learning application using React Native, Expo, and TypeScript.
- Supabase Auth and PostgreSQL with RLS.
- Vocabulary CRUD, flashcards, deterministic spaced repetition, daily goals, streak, progress, history, export, and deletion.
- Push-to-talk conversation: recording -> separately validated STT -> server-side provider adapter -> validated tutor response -> TTS playback.
- Autosave of confirmed turns, recovery after interruption, session summaries, corrections, and cost/usage guardrails.

### Explicitly deferred

- Full-duplex streaming voice, VAD, barge-in, real-time audio buffers, and latency tuning.
- Social features, leaderboard, payment, subscription, model fine-tuning, certification-equivalent speaking scores.
- Permanent raw-audio storage by default.

## Requirement traceability

| BRD requirements | Planned implementation surface | Verification gate |
|---|---|---|
| FR-01, FR-02, FR-11, FR-12; BR-08, BR-09, BR-10, BR-15 | Profile/settings, dashboard, daily activity, timezone-aware goals and streak | Supabase integration tests plus deterministic date/time unit tests |
| FR-03, FR-04; BR-07, BR-08 | Vocabulary repository, review events, documented SM-2/simple scheduler, approval state | CRUD/RLS tests and scheduler unit tests |
| FR-05, FR-06 | Server learning/AI orchestration and explicit suggestion approval | Provider contract tests and approval persistence tests |
| FR-07, FR-08, FR-14; NFR-01, NFR-02, NFR-06 | Voice state machine, Expo audio lifecycle, permission/error/offline UI | Device/manual matrix and state-machine tests |
| FR-09, FR-10; BR-01–BR-06, BR-11 | Sessions, messages, summaries, request/idempotency keys, recovery | Database integration and reconnect/duplicate tests |
| FR-13; BR-12, BR-16 | Export/delete workflows and audio retention policy | Export fixture validation and deletion cascade/restore tests |
| NFR-03, NFR-04; BR-01, BR-05, BR-12, BR-16 | Server auth/ownership checks, RLS, secret boundary, minimal logging | Security review, RLS matrix, bundle/log scan |
| NFR-07; BR-13, BR-14 | Per-user rate/token limits, usage log, daily hard cap, no paid fallback in Rp0 mode | Limit/timeout/rate-limit integration tests |
| NFR-05, NFR-08 | Domain/repository/provider separation and JSON/CSV export | Architecture review and export openability test |

## Domain and persistence baseline

The initial schema must cover `profiles`, `learning_goals`, `vocabulary`, `vocabulary_reviews`, `learning_sessions`, `session_messages`, `session_summaries`, `conversation_feedback`, `daily_activity`, `user_settings`, and `ai_usage_logs`. `session_audio_assets` remains opt-in and retention-bound.

Rules:

- Personal rows have direct `user_id` or a database-enforced ownership relation.
- Timestamps are stored in UTC; profile timezone is used for UI, daily goals, review dates, and streak.
- Confirmed messages are saved before the UI reports saved.
- Every retryable turn has an idempotency/request key and bounded retry budget.
- Transcript and model output are untrusted input until schema and ownership validation succeeds.
- Raw audio is not stored unless the user opts in and retention/deletion behavior is explicit.

## Tutor response contract

The server validates a response equivalent to:

```json
{
  "reply": "What do you usually do after work?",
  "corrections": [],
  "vocabulary_suggestions": [],
  "follow_up_question": "What do you enjoy doing most?",
  "session_complete": false
}
```

Malformed JSON may receive at most one controlled repair attempt. A provider error must not become a fabricated tutor response or delete an already-saved user message.

## Phase 0 exit checklist

- [x] BRD scope and exclusions are recorded.
- [x] Functional, nonfunctional, business, and QA requirements are mapped to implementation surfaces.
- [x] MVP voice path and deferred full-duplex path are separated.
- [x] Provider, platform, cost, privacy, and hosting decisions are explicitly listed in the decision register.
- [x] Stakeholder decisions are recorded for platform, cost mode, audio retention, scheduler, STT, and TTS in the decision register.
- [ ] Dependency versions and provider compatibility are verified in Phase 1 discovery against the selected decisions.

## Phase 1 entry checklist

Phase 1 may begin with the captured decisions. It must produce a runnable Expo/TypeScript baseline, router smoke test, design tokens, environment validation, and lint/test commands before any Supabase schema or learning feature work. Local STT compatibility and the DeepSeek server adapter remain verification gates for Phase 4.
