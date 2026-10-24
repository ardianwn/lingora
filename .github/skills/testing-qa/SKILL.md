---
name: testing-qa
description: "Use for unit, integration, database/RLS, voice-flow, offline/recovery, regression, and release testing of the AI English Voice Tutor."
---

# Testing and QA

## Procedure

1. Turn each acceptance criterion into a deterministic test case with setup, action, expected result, and cleanup.
2. Use unit tests for pure learning/state/provider logic; integration tests for Auth, API boundaries, persistence, and RLS.
3. Mock external AI/STT/TTS providers at unit level and use contract fixtures for success and failure shapes.
4. Test the push-to-talk state machine, permission denial, cancellation, interruption, network loss, retry, autosave, and recovery.
5. Run lint/typecheck/tests/build in the narrowest useful scope, then run the release suite at the phase gate.
6. Report exact commands and outcomes; never mark a test passing without running it.

## Release gate

Block release on secret exposure, cross-user data access, unbounded provider spend, unrecoverable confirmed-turn loss, or a broken Android microphone flow.

