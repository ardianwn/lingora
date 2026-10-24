# AI English Voice Tutor Agent Rules

## Source of truth and scope

- [`BRD_AI_English_Voice_Tutor_React_Native.pdf`](./BRD_AI_English_Voice_Tutor_React_Native.pdf) is the product source of truth. Do not add major features without explicit approval.
- MVP means React Native + Expo, Supabase Auth/PostgreSQL, provider-adapted DeepSeek LLM, separately validated STT/TTS, and push-to-talk voice conversation.
- Full-duplex voice, VAD, social features, payments, subscriptions, permanent audio storage by default, and model training are out of MVP scope.
- Read the relevant skill in `.github/skills/` before changing a subsystem.

## Required execution protocol

Every non-trivial task follows **Explore -> Plan -> Implement -> Test -> Review**:

1. Inspect the repository, BRD, existing conventions, and relevant dependencies.
2. State the affected phase, files, acceptance criteria, risks, and assumptions before broad edits.
3. Implement only the smallest coherent slice for the current phase.
4. Run the narrowest meaningful checks and report exact commands, actual results, failures, and remaining work.
5. Review the diff against the BRD, security requirements, accessibility, and regression risk.

Phases are sequential. Do not implement a later phase while an earlier phase has unresolved acceptance criteria:

0. Discovery and planning
1. Application foundation
2. Supabase Auth, schema, migrations, and RLS
3. Learning features and progress
4. Push-to-talk AI conversation
5. History, evaluation, and analytics
6. QA, security review, and release

## Non-negotiable engineering rules

- Keep DeepSeek, STT, and TTS secrets server-side. Never ship provider API keys in the Expo bundle or public environment variables.
- Treat LLM, STT, and TTS as separate capabilities unless the selected provider explicitly documents an integrated voice API.
- All user-owned Supabase data must have reviewed RLS policies and tests proving cross-user access is denied.
- All schema changes use reviewed, reversible Supabase migrations; never edit production schema manually.
- Validate input at trust boundaries, authenticate server-side requests, apply timeouts/retries with bounded budgets, and enforce per-user cost/usage limits.
- Persist confirmed conversation turns and support recovery after app close or network interruption. Do not claim persistence without a test.
- Do not store audio permanently by default. Document retention and consent for any exception.
- Do not invent test results, coverage, provider pricing, quotas, licensing, or availability. Verify current terms before choosing a service.
- Preserve user consent before paid-provider fallback or quota changes. Surface errors; do not silently fall back to a success-shaped response.
- Update directly related documentation, `.env.example`, acceptance criteria, and architecture decisions when behavior changes.
- Prefer typed interfaces, existing helpers, and platform-safe Expo APIs. Avoid `any` casts and duplicated provider/business logic.

## Completion report

Finish each phase with: files changed, acceptance criteria status, commands run with actual outcomes, known limitations, security/cost implications, and the next unblocked phase. A phase is not complete until its Definition of Done is met.

