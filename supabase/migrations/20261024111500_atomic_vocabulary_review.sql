create or replace function public.record_vocabulary_review(
  p_vocabulary_id uuid,
  p_rating text,
  p_reviewed_at timestamptz,
  p_next_review_at timestamptz,
  p_ease_factor numeric,
  p_interval_days integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null
     or p_rating not in ('again', 'hard', 'good', 'easy')
     or p_interval_days < 0
     or p_ease_factor < 1.3 then
    raise exception 'Invalid vocabulary review';
  end if;

  if not exists (
    select 1
    from public.vocabulary
    where id = p_vocabulary_id and user_id = current_user_id
  ) then
    raise exception 'Vocabulary item not found';
  end if;

  insert into public.vocabulary_reviews (
    user_id,
    vocabulary_id,
    rating,
    reviewed_at,
    next_review_at,
    ease_factor,
    interval_days
  ) values (
    current_user_id,
    p_vocabulary_id,
    p_rating,
    p_reviewed_at,
    p_next_review_at,
    p_ease_factor,
    p_interval_days
  );

  update public.vocabulary
  set mastery_status = case
    when p_rating = 'easy' then 'proficient'
    else 'learning'
  end
  where id = p_vocabulary_id and user_id = current_user_id;

  insert into public.daily_activity (
    user_id,
    activity_date,
    reviews_completed
  ) values (
    current_user_id,
    (p_reviewed_at at time zone 'UTC')::date,
    1
  )
  on conflict (user_id, activity_date)
  do update set
    reviews_completed = public.daily_activity.reviews_completed + 1,
    updated_at = timezone('utc', now());
end;
$$;

revoke execute on function public.record_vocabulary_review(
  uuid,
  text,
  timestamptz,
  timestamptz,
  numeric,
  integer
) from public, anon;
grant execute on function public.record_vocabulary_review(
  uuid,
  text,
  timestamptz,
  timestamptz,
  numeric,
  integer
) to authenticated;
