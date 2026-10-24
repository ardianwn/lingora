create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 80),
  english_level text not null default 'unknown'
    check (english_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'unknown')),
  daily_goal_minutes integer not null default 15
    check (daily_goal_minutes in (10, 15, 20, 30)),
  target_vocabulary integer not null default 10
    check (target_vocabulary between 1 and 100),
  timezone text not null default 'UTC',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  explanation_language text not null default 'id'
    check (explanation_language in ('id', 'en')),
  voice_id text,
  speech_speed numeric(3, 2) not null default 1.0
    check (speech_speed between 0.5 and 2.0),
  correction_mode text not null default 'important'
    check (correction_mode in ('none', 'important', 'all')),
  reminder_time time,
  audio_retention_enabled boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.learning_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  goal_type text not null check (goal_type in ('minutes', 'vocabulary', 'conversation')),
  target_value integer not null check (target_value > 0),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists learning_goals_one_active_type
  on public.learning_goals (user_id, goal_type)
  where active;

create table if not exists public.vocabulary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  word text not null check (char_length(word) between 1 and 120),
  meaning text not null check (char_length(meaning) between 1 and 500),
  definition text,
  part_of_speech text,
  example_sentence text,
  example_translation text,
  ipa text,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  topic text,
  source text,
  mastery_status text not null default 'learning'
    check (mastery_status in ('new', 'learning', 'proficient', 'mastered')),
  is_favorite boolean not null default false,
  is_difficult boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (id, user_id)
);

create unique index if not exists vocabulary_user_word_context
  on public.vocabulary (user_id, lower(word), lower(coalesce(topic, '')));

create table if not exists public.vocabulary_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  vocabulary_id uuid not null,
  rating text not null check (rating in ('again', 'hard', 'good', 'easy')),
  reviewed_at timestamptz not null default timezone('utc', now()),
  next_review_at timestamptz not null,
  ease_factor numeric(4, 2),
  interval_days integer not null default 0 check (interval_days >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  foreign key (vocabulary_id, user_id)
    references public.vocabulary(id, user_id) on delete cascade
);

create index if not exists vocabulary_reviews_due
  on public.vocabulary_reviews (user_id, next_review_at);

create table if not exists public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mode text not null check (mode in ('daily_conversation', 'workplace', 'job_interview', 'free')),
  topic text,
  level text not null default 'unknown'
    check (level in ('A1', 'A2', 'B1', 'B2', 'C1', 'unknown')),
  duration_target_seconds integer check (duration_target_seconds between 60 and 7200),
  status text not null default 'active'
    check (status in ('active', 'completed', 'interrupted', 'error')),
  started_at timestamptz not null default timezone('utc', now()),
  ended_at timestamptz,
  duration_seconds integer check (duration_seconds between 0 and 7200),
  end_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (id, user_id),
  check (ended_at is null or ended_at >= started_at),
  check (status = 'active' or ended_at is not null)
);

create index if not exists learning_sessions_user_recent
  on public.learning_sessions (user_id, started_at desc);

create table if not exists public.session_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null check (char_length(content) between 1 and 12000),
  turn_index integer not null check (turn_index >= 0),
  request_id text,
  transcript_status text not null default 'confirmed'
    check (transcript_status in ('pending', 'confirmed', 'corrected', 'failed')),
  save_status text not null default 'saved'
    check (save_status in ('pending', 'saved', 'failed')),
  audio_duration_ms integer check (audio_duration_ms is null or audio_duration_ms between 0 and 600000),
  created_at timestamptz not null default timezone('utc', now()),
  foreign key (session_id, user_id)
    references public.learning_sessions(id, user_id) on delete cascade,
  unique (session_id, turn_index, role),
  unique (id, session_id, user_id)
);

create unique index if not exists session_messages_request_id
  on public.session_messages (session_id, request_id)
  where request_id is not null;

create index if not exists session_messages_order
  on public.session_messages (session_id, turn_index);

create table if not exists public.session_summaries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  summary text,
  corrections jsonb not null default '[]'::jsonb,
  vocabulary jsonb not null default '[]'::jsonb,
  next_steps jsonb not null default '[]'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'ready', 'failed')),
  generation_key text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (session_id, user_id)
    references public.learning_sessions(id, user_id) on delete cascade,
  unique (session_id),
  unique (session_id, generation_key)
);

create table if not exists public.conversation_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  message_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  feedback_type text not null check (feedback_type in ('grammar', 'vocabulary', 'naturalness')),
  original_text text not null,
  corrected_text text not null,
  explanation text,
  created_at timestamptz not null default timezone('utc', now()),
  foreign key (session_id, user_id)
    references public.learning_sessions(id, user_id) on delete cascade,
  foreign key (message_id, session_id, user_id)
    references public.session_messages(id, session_id, user_id) on delete cascade
);

create table if not exists public.daily_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_date date not null,
  minutes_learned integer not null default 0 check (minutes_learned between 0 and 1440),
  sessions_completed integer not null default 0 check (sessions_completed >= 0),
  reviews_completed integer not null default 0 check (reviews_completed >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, activity_date)
);

create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,
  model text not null,
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  request_status text not null check (request_status in ('started', 'succeeded', 'failed', 'rate_limited')),
  request_id text,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists ai_usage_logs_request_id
  on public.ai_usage_logs (user_id, request_id)
  where request_id is not null;

create index if not exists ai_usage_logs_user_date
  on public.ai_usage_logs (user_id, created_at desc);

create or replace function public.reserve_ai_usage(
  p_provider text,
  p_model text,
  p_request_id text,
  p_daily_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := (select auth.uid());
  usage_count integer;
begin
  if current_user_id is null or p_daily_limit < 1 or p_daily_limit > 1000 then
    return false;
  end if;

  if exists (
    select 1
    from public.ai_usage_logs
    where user_id = current_user_id and request_id = p_request_id
  ) then
    return false;
  end if;

  select count(*)::integer
    into usage_count
    from public.ai_usage_logs
    where user_id = current_user_id
      and created_at >= date_trunc('day', timezone('utc', now()));

  if usage_count >= p_daily_limit then
    return false;
  end if;

  insert into public.ai_usage_logs (
    user_id, provider, model, request_status, request_id
  ) values (
    current_user_id, p_provider, p_model, 'started', p_request_id
  );

  return true;
end;
$$;

revoke execute on function public.reserve_ai_usage(text, text, text, integer) from public, anon;
grant execute on function public.reserve_ai_usage(text, text, text, integer) to authenticated;

create table if not exists public.session_audio_assets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  duration_ms integer not null check (duration_ms between 0 and 600000),
  retention_until timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  foreign key (session_id, user_id)
    references public.learning_sessions(id, user_id) on delete cascade
);

create index if not exists session_audio_assets_retention
  on public.session_audio_assets (retention_until);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'user_settings',
    'learning_goals',
    'vocabulary',
    'vocabulary_reviews',
    'learning_sessions',
    'session_messages',
    'session_summaries',
    'conversation_feedback',
    'daily_activity',
    'ai_usage_logs'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute procedure public.set_updated_at()',
      table_name
    );
  end loop;
end;
$$;

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.learning_goals enable row level security;
alter table public.vocabulary enable row level security;
alter table public.vocabulary_reviews enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.session_messages enable row level security;
alter table public.session_summaries enable row level security;
alter table public.conversation_feedback enable row level security;
alter table public.daily_activity enable row level security;
alter table public.ai_usage_logs enable row level security;
alter table public.session_audio_assets enable row level security;

create policy profiles_owner_select on public.profiles
  for select using (id = (select auth.uid()));
create policy profiles_owner_insert on public.profiles
  for insert with check (id = (select auth.uid()));
create policy profiles_owner_update on public.profiles
  for update using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy profiles_owner_delete on public.profiles
  for delete using (id = (select auth.uid()));

create policy user_settings_owner_all on public.user_settings
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy learning_goals_owner_all on public.learning_goals
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy vocabulary_owner_all on public.vocabulary
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy vocabulary_reviews_owner_all on public.vocabulary_reviews
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy learning_sessions_owner_all on public.learning_sessions
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy session_messages_owner_all on public.session_messages
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy session_summaries_owner_all on public.session_summaries
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy conversation_feedback_owner_all on public.conversation_feedback
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy daily_activity_owner_all on public.daily_activity
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy ai_usage_logs_owner_all on public.ai_usage_logs
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy session_audio_assets_owner_all on public.session_audio_assets
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
