# Lingora

**AI-powered language learning**

React Native + Expo foundation for Lingora, the AI English Voice Tutor described in the
[BRD](./BRD_AI_English_Voice_Tutor_React_Native.pdf).

## Current phase

Phase 1 — Foundation. The app currently contains the Expo Router shell, typed
configuration validation, and a roadmap status screen. Supabase, learning
features, and voice are intentionally not implemented until their phase gates
are reached.

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

## Delivery rules

Read [`AGENTS.md`](./AGENTS.md), [`docs/implementation-plan.md`](./docs/implementation-plan.md),
and the relevant skill in [`.github/skills/`](./.github/skills/) before making
changes. Work sequentially through the phase gates; do not treat the current
shell screens as completed product features.
