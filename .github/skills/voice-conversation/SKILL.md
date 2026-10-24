---
name: voice-conversation
description: "Use for microphone permissions, recording, STT, AI response, TTS, push-to-talk state, audio lifecycle, interruption, recovery, and voice error handling."
---

# Voice Conversation

## Procedure

1. Confirm the selected STT and TTS capabilities, pricing, quotas, retention, licensing, and Expo compatibility separately from the LLM.
2. Model explicit states: idle, requesting-permission, recording, uploading, transcribing, generating, speaking, paused, retryable-error, fatal-error, and ended.
3. Request microphone permission with clear user-facing rationale; handle denial and revocation without trapping the user.
4. Bound recording duration/size, normalize cancellation, and avoid permanent audio storage unless consent and retention are documented.
5. Send authenticated transcript input through the server provider boundary, then play TTS with cleanup on unmount/background.
6. Autosave each confirmed turn and make retries idempotent so reconnects do not duplicate messages.
7. Test permission denial, interruption, no speech, network loss at every stage, app backgrounding, retry, and recovery.

## MVP boundary

Implement push-to-talk first. Do not introduce full-duplex, VAD, streaming audio, or barge-in behavior without a separate approved phase.

