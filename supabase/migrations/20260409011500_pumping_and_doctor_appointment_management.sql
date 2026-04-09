alter table public.feeding_sessions
drop constraint if exists feeding_sessions_feed_type_check;

alter table public.feeding_sessions
add constraint feeding_sessions_feed_type_check
check (feed_type in ('breast', 'bottle', 'pumping'));

create or replace function public.app_start_feed_session(
  p_feeding_session_id uuid,
  p_household_id uuid,
  p_baby_id uuid,
  p_feed_type text,
  p_started_at timestamptz,
  p_client_created_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_session public.feeding_sessions;
begin
  perform public.assert_baby_in_household(p_baby_id, p_household_id);

  insert into public.feeding_sessions (
    id,
    household_id,
    baby_id,
    feed_type,
    started_at,
    created_by,
    client_created_at
  ) values (
    p_feeding_session_id,
    p_household_id,
    p_baby_id,
    p_feed_type,
    p_started_at,
    current_user_id,
    p_client_created_at
  )
  on conflict (id)
  do update set
    feed_type = excluded.feed_type,
    started_at = excluded.started_at,
    updated_at = timezone('utc', now())
  returning * into target_session;

  perform public.upsert_medical_timeline_event(
    p_household_id,
    p_baby_id,
    'feeding_sessions',
    target_session.id,
    'feed',
    target_session.started_at,
    case
      when target_session.feed_type = 'bottle' then 'Bottle feed'
      when target_session.feed_type = 'pumping' then 'Pumping session'
      else 'Breastfeed'
    end,
    'In progress'
  );

  return row_to_json(target_session)::jsonb;
end;
$$;

create or replace function public.app_finish_feed_session(
  p_feeding_session_id uuid,
  p_household_id uuid,
  p_baby_id uuid,
  p_finished_at timestamptz,
  p_outcome text,
  p_latch_issue boolean,
  p_sleepy_feed boolean,
  p_refused_feed boolean,
  p_spit_up boolean,
  p_bottle_amount numeric default null,
  p_bottle_unit text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_session public.feeding_sessions;
  total_seconds integer;
begin
  perform public.assert_baby_in_household(p_baby_id, p_household_id);

  update public.feeding_sessions
  set finished_at = p_finished_at,
      outcome = p_outcome,
      latch_issue = coalesce(p_latch_issue, false),
      sleepy_feed = coalesce(p_sleepy_feed, false),
      refused_feed = coalesce(p_refused_feed, false),
      spit_up = coalesce(p_spit_up, false),
      bottle_amount = p_bottle_amount,
      bottle_unit = p_bottle_unit,
      updated_at = timezone('utc', now())
  where id = p_feeding_session_id
    and household_id = p_household_id
    and baby_id = p_baby_id
  returning * into target_session;

  if target_session.id is null then
    raise exception 'Feeding session not found';
  end if;

  select coalesce(sum(greatest(0, extract(epoch from (coalesce(ended_at, p_finished_at) - started_at))::integer)), 0)
  into total_seconds
  from public.feeding_segments
  where feeding_session_id = target_session.id;

  perform public.upsert_medical_timeline_event(
    p_household_id,
    p_baby_id,
    'feeding_sessions',
    target_session.id,
    'feed',
    target_session.started_at,
    case
      when target_session.feed_type = 'bottle' then 'Bottle feed'
      when target_session.feed_type = 'pumping' then 'Pumping session'
      else 'Breastfeed'
    end,
    case
      when target_session.feed_type = 'bottle' and target_session.bottle_amount is not null
        then concat(target_session.bottle_amount, coalesce(target_session.bottle_unit, 'ml'))
      else concat(total_seconds / 60, 'm total')
    end
  );

  return row_to_json(target_session)::jsonb;
end;
$$;

create or replace function public.app_delete_doctor_appointment(
  p_appointment_id uuid,
  p_household_id uuid,
  p_baby_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_baby_in_household(p_baby_id, p_household_id);

  delete from public.medical_timeline_events
  where household_id = p_household_id
    and baby_id = p_baby_id
    and source_table = 'doctor_appointments'
    and source_id = p_appointment_id;

  delete from public.doctor_appointments
  where id = p_appointment_id
    and household_id = p_household_id
    and baby_id = p_baby_id;
end;
$$;

revoke all on function public.app_delete_doctor_appointment(uuid, uuid, uuid) from public;
grant execute on function public.app_delete_doctor_appointment(uuid, uuid, uuid) to authenticated;
