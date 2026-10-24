# Architecture Baseline

```text
Expo mobile client
  -> authenticated server boundary
      -> provider adapters (LLM / STT / TTS)
  -> Supabase Auth + PostgreSQL (RLS)
```

The mobile app owns presentation, navigation, microphone permission, recording/playback lifecycle, and optimistic state. Privileged provider calls, validation, quotas, retries, and cost decisions belong behind a server boundary. Supabase stores confirmed learning data and conversation metadata; raw audio is not retained by default.

The MVP conversation path is push-to-talk. LLM, STT, and TTS are independent interfaces so a provider can be replaced without changing session or learning domain logic.

## Current LLM provider

The current adapter targets NVIDIA's OpenAI-compatible hosted API at
`https://integrate.api.nvidia.com/v1`. The model is supplied through the
server-only `NVIDIA_MODEL` setting because free catalog availability and model
names can change. `NVIDIA_API_KEY` must never be placed in Expo configuration,
mobile logs, or client responses.

NVIDIA hosted access is treated as free-tier prototyping, not unlimited free
production capacity. The service must enforce request/token limits and return a
clear error when the configured quota is unavailable. It must not silently
switch to a paid provider.

The `tutor-chat` Edge Function adds a server-owned tutor system prompt, rejects
client-supplied system messages, records usage, and enforces the configured
`NVIDIA_DAILY_REQUEST_LIMIT` before calling NVIDIA.
