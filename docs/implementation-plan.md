# Implementation Plan

Source: [BRD](../BRD_AI_English_Voice_Tutor_React_Native.pdf), version 1.0 dated 23 October 2026.

## Phase gates

| Phase | Deliverable | Exit criteria |
|---|---|---|
| 0. Discovery | Architecture, dependency decision log, acceptance criteria | BRD scope mapped; unresolved provider/cost decisions recorded |
| 1. Foundation | Expo/TypeScript app, Expo Router, design tokens, env validation, lint/test baseline | Clean startup, navigation smoke test, no secrets in bundle |
| 2. Supabase | Auth, profile, learning/session schema, migrations, indexes, RLS | Auth flows work; cross-user reads/writes are denied by database tests |
| 3. Learning | Dashboard, goals, streak, vocabulary, flashcards, spaced repetition, progress | Core user stories pass; scheduling and persistence are deterministic |
| 4. Voice | Push-to-talk recording -> STT -> server AI -> TTS, turn autosave/recovery | Permission/error/retry paths pass; no provider secret reaches client |
| 5. Evaluation | History, transcript, grammar feedback, accepted vocabulary, summaries, analytics/export | Confirmed data is recoverable; no fabricated score or summary |
| 6. Release | Device QA, offline/recovery, security/cost review, release build | Release checklist passes; known limitations and provider terms documented |

Detailed requirement traceability is in [`docs/brd-traceability.md`](./brd-traceability.md). Open decisions are in [`docs/decisions/0002-open-implementation-decisions.md`](./decisions/0002-open-implementation-decisions.md).

## Execution contract

Each issue must identify one phase, one vertical slice, dependencies, acceptance criteria, test commands, and non-goals. A later-phase issue stays blocked until its prerequisite issue is complete. Full-duplex voice is a separate post-MVP plan item.

## Decisions requiring verification

- Exact DeepSeek-compatible provider, current price/quota/retention, and paid-fallback consent.
- STT and TTS engines, offline capability, Android Expo compatibility, pricing, and data retention.
- Server hosting and secret management.
- Audio retention policy and export format.

## Phase 0 outcome

The BRD has been mapped to implementation surfaces and acceptance gates. Phase 1 remains blocked only by the open product decisions in the decision register and by verification of the selected dependency/provider versions. No Supabase, learning, or voice implementation should start before the Phase 1 foundation gate is accepted.

## Phase 1 progress

Completed:

- Official Expo SDK 58 default TypeScript/Expo Router scaffold.
- Android-first app identity and public-only `.env.example` configuration.
- Typed public API URL validation; provider secrets are explicitly excluded from the mobile environment.
- Initial mobile shell and roadmap screen, with starter tutorial content removed.
- Lint, TypeScript, Expo config, and web export smoke checks.
- Jest test runner with an initial deterministic environment-validation test.

Phase 1 validation:

- [x] Android device navigation smoke test completed on device `2312DRAABG`.
- [x] Expo Go launched the app; Metro returned `packager-status:running`.
- [x] Home shell rendered and Explore navigation rendered `Roadmap fase`.
- [x] Lint, Jest, TypeScript, Expo config, and web export checks passed.

Known limitation:

- `npm audit --omit=dev` reports four high-severity transitive `node-forge` findings through Expo CLI. No forced audit fix was applied because npm proposed downgrading Expo to 44; this remains a release/security-review item.

Phase 1 is complete. Phase 2 is in progress:

- [x] Supabase CLI project configuration and reviewed initial migration.
- [x] Auth-linked profile/settings trigger and MVP learning/session schema.
- [x] Ownership-bound foreign keys, indexes, idempotency keys, retention fields, and RLS policies.
- [x] Schema/retention documentation and empty non-user seed policy.
- [x] NVIDIA server-side provider adapter with typed tutor contract, bounded retry, timeout, and input validation.
- [x] Expo Supabase client with persisted Auth session and public-key validation.
- [x] Supabase Auth client service for email signup, sign-in, session lookup, and sign-out.
- [x] Auth UI with session restore, signup confirmation messaging, loading/error states, and logout.
- [x] Executable pgTAP coverage for core RLS, ownership constraints, signup defaults, and usage limits.
- [x] NVIDIA secrets configured in the hosted Supabase project; model/quota values are stored server-side and were not exposed.
- [x] Local database execution and passing RLS test run.
- [x] Cross-user read/ownership denial, signup defaults, and usage idempotency evidence.
- [x] Hosted database linked, migration applied, and migration history matched.
- [x] `tutor-chat` deployed to the hosted Supabase project.
- [ ] Authenticated live NVIDIA request and provider-contract response verification.

Latest validation:

- [x] `npm run lint`
- [x] `npm test` (4 tests)
- [x] `npx tsc --noEmit` for the Expo client; Deno Edge Functions are intentionally excluded from the mobile compiler.
- [x] Expo web export with SSR-safe Supabase storage.
- [x] `npx supabase db lint --local` (no schema errors).
- [x] Edge Function runtime reached the local function endpoint during `supabase functions serve`; the local edge container then stopped and requires a healthy Docker runtime for persistent serving.
- [x] Local Auth smoke test: signup, sign-in, and authenticated profile select returned HTTP 200.
- [x] Hosted protected-function smoke test: unauthenticated `tutor-chat` request returned HTTP 401.
- [ ] Hosted signup/live tutor smoke test; latest attempt returned HTTP 429 (`email rate limit exceeded`).

Hosted deployment is now verified for linkage, migration parity, configured secret names,
and function deployment. Provider output remains unverified until hosted Auth permits
an authenticated test user.

## Phase 3 progress

- [x] Initial authenticated dashboard slice reads the user profile, active learning goals,
  and current-day activity from Supabase.
- [x] Dashboard has loading, empty, retryable error, and logout states without inventing
  proficiency or score data.
- [x] Vocabulary list/create slice with ownership enforced by Supabase RLS.
- [x] Deterministic spaced-repetition scheduler with boundary tests for review ratings.
- [x] Flashcard review UI with due-card selection and four review ratings.
- [x] Atomic server-side review write updates vocabulary mastery and daily review activity.
- [ ] Streak/goal aggregation and full learning progress summary.

Latest Phase 3 validation:

- [x] `npm run lint`
- [x] `npm test` (8 tests)
- [x] `npx tsc --noEmit`
- [x] Expo web export
- [x] Local migration reset and schema lint
- [x] pgTAP RLS/review suite (15 tests passed)
- [x] Hosted migration history matches local migrations through
  `20261024111500_atomic_vocabulary_review`
- [x] Android device smoke test on `2312DRAABG`: Auth signup reached the dashboard,
  vocabulary screen loaded, and vocabulary creation succeeded after fixing the missing
  `user_id` insert payload required by RLS.
- [x] Android visual check fixed dark-mode Auth card contrast; no React Native fatal
  exception or redbox was observed after the fix.

Phase 2 provider follow-up:

- Hosted Auth signup and profile access now pass.
- An authenticated `tutor-chat` request reached the deployed function but returned HTTP 502
  with the generic provider-unavailable response. The NVIDIA provider/model contract still
  needs investigation before voice/conversation work begins.
