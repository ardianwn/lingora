---
name: project-orchestrator
description: "Use when planning or executing AI English Voice Tutor work: read the BRD, identify the current phase, enforce sequential delivery, define acceptance criteria, and prevent scope jumps."
argument-hint: "Describe the requested feature or phase"
---

# Project Orchestrator

## Procedure

1. Read `AGENTS.md`, the BRD, `docs/implementation-plan.md`, and the relevant subsystem skill.
2. Map the request to exactly one phase. If it spans phases, split it and start only with the earliest incomplete phase.
3. Inspect existing files and dependencies before proposing edits.
4. Write a short plan with scope, non-goals, dependencies, acceptance criteria, and risks.
5. Implement the smallest vertical slice, then run targeted tests.
6. Review the diff for BRD alignment, security, cost, and documentation impact.
7. Report evidence and leave the next phase explicit.

## Phase gates

Do not start Supabase features before foundation checks pass, learning features before Auth/RLS checks pass, or voice features before the learning/session model exists. Escalate ambiguous product decisions instead of silently choosing a large feature.

