# Database Schema

The schema is defined by the reviewed migration in
[`supabase/migrations/20261024095000_initial_learning_schema.sql`](../supabase/migrations/20261024095000_initial_learning_schema.sql).

## Ownership and security

- `profiles` is keyed by `auth.users.id`.
- Every personal table has a direct `user_id`, or a composite foreign key that binds the child to `(parent_id, user_id)`.
- Every personal table has RLS enabled.
- Client policies compare ownership with `auth.uid()`; client-side filtering is not authorization.
- The `handle_new_user` trigger creates a profile and default settings row after signup.
- Service-role access is server-only and is not configured in Expo.

## Lifecycle and retention

- Timestamps are stored in UTC.
- Profile timezone is used later by daily goal, streak, and review scheduling code.
- Confirmed session messages are retained as text and metadata; raw audio is not created by default.
- `session_audio_assets` is opt-in and requires a retention deadline. A scheduled cleanup job must delete expired objects and rows before audio storage is enabled.
- Deleting an Auth user cascades through `profiles` and personal rows.

## Migration and verification

Apply locally or to a linked Supabase project with the Supabase CLI:

```bash
npx supabase db reset
npx supabase db lint
npx supabase test db
```

The Phase 2 pgTAP coverage is in
[`supabase/tests/phase2_rls_test.sql`](../supabase/tests/phase2_rls_test.sql).
It runs in a transaction and covers anonymous denial, owner access,
cross-user isolation, composite ownership enforcement, signup defaults,
and usage reservation idempotency/limits. Do not apply the migration manually
in production.

For the hosted Supabase project, link the CLI and apply reviewed migrations with
`supabase db push`. Edge Function secrets must be configured with
`supabase secrets set`; they must not be placed in Expo `.env` files.

Before Phase 2 is complete, add database tests covering:

1. Unauthenticated select/insert/update/delete denial.
2. Authenticated owner CRUD success.
3. Cross-user access denial for every personal table.
4. Child ownership mismatch rejection through composite foreign keys.
5. Signup trigger creation and Auth-user deletion cascade.
6. Duplicate request/idempotency rejection.

The `reserve_ai_usage` security-definer function performs the daily usage
reservation atomically for the authenticated user before a provider call. It
is executable by `authenticated` only; the service-role key is not required by
the mobile client.
