begin;

select plan(15);

delete from auth.users
where id in (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
);

insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) values
  (
    '00000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'rls-owner@example.com',
    'test-password',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'rls-other@example.com',
    'test-password',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  );

select is(
  (select count(*) from public.profiles
    where id in (
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002'
    )),
  2::bigint,
  'signup trigger creates one profile per test user'
);

select is(
  (select count(*) from public.user_settings
    where user_id in (
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002'
    )),
  2::bigint,
  'signup trigger creates default settings per test user'
);

set local role anon;
select set_config('request.jwt.claim.sub', '', true);

select is(
  (select count(*) from public.profiles),
  0::bigint,
  'unauthenticated users cannot read profiles'
);

select throws_ok(
  $$insert into public.learning_goals (user_id, goal_type, target_value)
    values ('00000000-0000-0000-0000-000000000001', 'minutes', 15)$$,
  '42501',
  null,
  'unauthenticated users cannot insert learning goals'
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000001',
  true
);

insert into public.learning_goals (id, user_id, goal_type, target_value)
values (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'minutes',
  15
);

insert into public.vocabulary (id, user_id, word, meaning)
values (
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'practice',
  'latihan'
);

insert into public.learning_sessions (
  id,
  user_id,
  mode,
  status
) values (
  '30000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'free',
  'active'
);

select is(
  (select count(*) from public.learning_goals),
  1::bigint,
  'owner can insert and read a learning goal'
);

select is(
  (select count(*) from public.vocabulary where word = 'practice'),
  1::bigint,
  'owner can insert and read vocabulary'
);

select lives_ok(
  $$select public.record_vocabulary_review(
      '20000000-0000-0000-0000-000000000001',
      'good',
      '2026-01-01T00:00:00Z',
      '2026-01-06T00:00:00Z',
      2.5,
      5
    )$$,
  'owner can record a vocabulary review'
);

select is(
  (select reviews_completed from public.daily_activity
    where user_id = '00000000-0000-0000-0000-000000000001'
      and activity_date = '2026-01-01'),
  1,
  'review increments daily activity atomically'
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000002',
  true
);

select is(
  (select count(*) from public.learning_goals),
  0::bigint,
  'another user cannot read the owner learning goal'
);

select is(
  (select count(*) from public.vocabulary),
  0::bigint,
  'another user cannot read the owner vocabulary'
);

select is(
  (select count(*) from public.learning_goals
    where id = '10000000-0000-0000-0000-000000000001'),
  0::bigint,
  'another user cannot update or target the owner goal'
);

select throws_ok(
  $$insert into public.session_messages (
      session_id, user_id, role, content, turn_index
    ) values (
      '30000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002',
      'user',
      'cross-user message',
      0
    )$$,
  '23503',
  null,
  'composite foreign key rejects child ownership mismatch'
);

select is(
  public.reserve_ai_usage('nvidia', 'free-model', 'request-1', 1),
  true,
  'owner can reserve the first request'
);

select is(
  public.reserve_ai_usage('nvidia', 'free-model', 'request-1', 1),
  false,
  'duplicate request id is rejected'
);

select is(
  public.reserve_ai_usage('nvidia', 'free-model', 'request-2', 1),
  false,
  'daily usage limit is enforced'
);

reset role;
select * from finish();
rollback;
