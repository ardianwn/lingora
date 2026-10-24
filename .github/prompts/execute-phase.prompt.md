---
description: "Execute one bounded AI English Voice Tutor roadmap phase using the BRD, phase gates, tests, and review protocol."
agent: "agent"
---

Use the repository's `AGENTS.md`, BRD, `docs/implementation-plan.md`, and the relevant `.github/skills/*/SKILL.md`.

Requested phase or issue: ${input:phase:Name the single phase or issue to execute}

Follow this order without skipping:

1. Explore the repository and current phase gate.
2. Plan one coherent vertical slice, including non-goals and acceptance criteria.
3. Implement only that slice.
4. Test with exact commands and record actual outcomes.
5. Review the diff for BRD scope, security, cost, accessibility, persistence, and documentation.

Stop and ask for a decision when the task requires an unverified provider, paid fallback, major scope expansion, or a phase prerequisite that is not complete. Never claim unrun tests passed.

