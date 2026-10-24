---
name: react-native-expo
description: "Use for React Native, Expo, TypeScript, Expo Router, app lifecycle, permissions, Android configuration, secure environment handling, and mobile platform behavior."
---

# React Native and Expo

## Procedure

1. Confirm Expo SDK, React Native, TypeScript, and router versions from manifests before coding.
2. Follow existing navigation and styling conventions; keep screens thin and move domain logic into typed modules.
3. Separate platform-specific behavior with supported Expo APIs and explicit Android permission/configuration changes.
4. Handle foreground/background lifecycle, loading, offline, denied-permission, and retry states explicitly.
5. Keep only public, non-secret configuration in the client bundle. Route privileged work through the server boundary.
6. Test on the smallest relevant platform target and document device/emulator limitations.

## Guardrails

Do not assume web APIs, background audio, microphone behavior, or native modules work in Expo managed workflow. Verify the selected SDK documentation and config plugin requirements before adding a dependency.

