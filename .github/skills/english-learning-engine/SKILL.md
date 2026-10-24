---
name: english-learning-engine
description: "Use for vocabulary CRUD, flashcards, spaced repetition, levels, grammar corrections, conversation summaries, and measurable learning progress."
---

# English Learning Engine

## Procedure

1. Define the learning event and source of truth before implementing UI.
2. Keep scheduling deterministic, timezone-aware, explainable, and covered by boundary tests.
3. Store user-confirmed vocabulary and corrections separately from model suggestions until accepted.
4. Do not invent scores or claim proficiency; show evidence, confidence, and unavailable data honestly.
5. Make summaries idempotent and link them to the session/version that produced them.

