# Lingora

**AI-powered language learning**

React Native + Expo foundation for Lingora, the AI English Voice Tutor described in the
[BRD](./BRD_AI_English_Voice_Tutor_React_Native.pdf).

## Current phase

Phase 3 — Learning features. The app now includes Supabase email
authentication, a protected dashboard, vocabulary creation and listing, and a
deterministic flashcard review scheduler. Push-to-talk voice remains gated
until the provider contract and voice test plan are complete.

## Local setup

```bash
npm install
cp .env.example .env
npm run lint
npm test
npx tsc --noEmit
npm start
```

Only public client configuration may use `EXPO_PUBLIC_*`. The Supabase URL and
anon key are public client values; Supabase service-role, NVIDIA, STT, TTS, and
other provider secrets must remain on the server.

For hosted Supabase development, apply migrations with the Supabase CLI after
linking the project. Provider secrets belong in Supabase Edge Function secrets,
never in the Expo `.env` file.

## Validation

Run the focused checks before opening a pull request:

```bash
npm run lint
npm test -- --runInBand
npx tsc --noEmit
```

Database and device checks are documented in
[`docs/implementation-plan.md`](./docs/implementation-plan.md).

## Delivery rules

Read [`AGENTS.md`](./AGENTS.md), [`docs/implementation-plan.md`](./docs/implementation-plan.md),
and the relevant skill in [`.github/skills/`](./.github/skills/) before making
changes. Work sequentially through the phase gates; do not treat the current
shell screens as completed product features.
