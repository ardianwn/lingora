---
name: supabase-backend
description: "Use for Supabase Auth, PostgreSQL schema, migrations, indexes, RLS policies, session persistence, and tests for user-owned learning data."
---

# Supabase Backend

## Procedure

1. Model ownership, lifecycle, retention, and query patterns before writing SQL.
2. Add a timestamped migration for every schema or policy change; keep migrations reviewable and idempotent where practical.
3. Add constraints, indexes for real query paths, and least-privilege RLS policies tied to `auth.uid()`.
4. Test authenticated access, unauthenticated denial, cross-user denial, update/delete ownership, and cascade behavior.
5. Use typed generated/database types at the application boundary and handle nullable/error results explicitly.
6. Document schema, retention, seed data, rollback considerations, and local test commands.

## Guardrails

Never rely on client filtering as authorization. Never expose the service-role key to Expo. Do not store raw audio by default; store only the minimum confirmed transcript and metadata needed by the BRD.

