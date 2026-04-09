create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.app_current_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid()
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.households (
  id uuid primary key,
  name text not null,
  invite_code text not null unique,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.household_members (
  id uuid primary key,
  household_id uuid not null references public.households(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role = 'parent'),
  status text not null check (status = 'active'),
  joined_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (household_id, profile_id)
);

create table if not exists public.babies (
  id uuid primary key,
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  birth_date timestamptz not null,
  birth_weight numeric(6, 2),
  birth_length numeric(6, 2),
  created_by uuid not null references public.profiles(id) on delete restrict,
  client_created_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sleep_sessions (
  id uuid primary key,
  household_id uuid not null references public.households(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz,
  notes text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  client_created_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.feeding_sessions (
  id uuid primary key,
  household_id uuid not null references public.households(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  feed_type text not null check (feed_type in ('breast', 'bottle')),
  started_at timestamptz not null,
  finished_at timestamptz,
  bottle_amount numeric(8, 2),
  bottle_unit text check (bottle_unit in ('ml', 'oz')),
  outcome text check (outcome in ('good', 'fair', 'poor')),
  latch_issue boolean not null default false,
  sleepy_feed boolean not null default false,
  refused_feed boolean not null default false,
  spit_up boolean not null default false,
  created_by uuid not null references public.profiles(id) on delete restrict,
  client_created_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.feeding_segments (
  id uuid primary key,
  household_id uuid not null references public.households(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  feeding_session_id uuid not null references public.feeding_sessions(id) on delete cascade,
  side text not null check (side in ('left', 'right')),
  started_at timestamptz not null,
  ended_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  client_created_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.diaper_events (
  id uuid primary key,
  household_id uuid not null references public.households(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  diaper_type text not null check (diaper_type in ('wet', 'dirty', 'both')),
  stool_color text,
  stool_consistency text check (stool_consistency in ('soft', 'watery', 'hard', 'mucus', 'bloody')),
  mucus boolean not null default false,
  blood boolean not null default false,
  urine_note text,
  notes text,
  occurred_at timestamptz not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  client_created_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.health_events (
  id uuid primary key,
  household_id uuid not null references public.households(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  event_type text not null check (event_type in ('temperature', 'medication')),
  value_numeric numeric(8, 2),
  unit text,
  medication_name text,
  dosage text,
  notes text,
  occurred_at timestamptz not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  client_created_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.symptom_events (
  id uuid primary key,
  household_id uuid not null references public.households(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  symptom text not null,
  notes text,
  occurred_at timestamptz not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  client_created_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.growth_measurements (
  id uuid primary key,
  household_id uuid not null references public.households(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  weight numeric(8, 2),
  weight_unit text check (weight_unit in ('kg', 'lb')),
  length numeric(8, 2),
  length_unit text check (length_unit in ('cm', 'in')),
  notes text,
  occurred_at timestamptz not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  client_created_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.doctor_appointments (
  id uuid primary key,
  household_id uuid not null references public.households(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  provider text,
  scheduled_at timestamptz,
  location text,
  planning_notes text,
  visit_notes text,
  status text not null check (status in ('planned', 'unscheduled', 'completed', 'cancelled')),
  created_by uuid not null references public.profiles(id) on delete restrict,
  client_created_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.doctor_questions (
  id uuid primary key,
  household_id uuid not null references public.households(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  doctor_appointment_id uuid not null references public.doctor_appointments(id) on delete cascade,
  question text not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  client_created_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.medical_timeline_events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  source_table text not null,
  source_id uuid not null,
  event_type text not null,
  occurred_at timestamptz not null,
  title text not null,
  summary text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (source_table, source_id)
);

create index if not exists idx_household_members_profile on public.household_members(profile_id);
create index if not exists idx_babies_household on public.babies(household_id);
create index if not exists idx_sleep_sessions_baby_start on public.sleep_sessions(baby_id, start_time desc);
create index if not exists idx_feeding_sessions_baby_start on public.feeding_sessions(baby_id, started_at desc);
create index if not exists idx_diaper_events_baby_time on public.diaper_events(baby_id, occurred_at desc);
create index if not exists idx_health_events_baby_time on public.health_events(baby_id, occurred_at desc);
create index if not exists idx_symptom_events_baby_time on public.symptom_events(baby_id, occurred_at desc);
create index if not exists idx_growth_measurements_baby_time on public.growth_measurements(baby_id, occurred_at desc);
create index if not exists idx_doctor_appointments_baby_time on public.doctor_appointments(baby_id, scheduled_at desc nulls last, created_at desc);
create index if not exists idx_doctor_questions_appointment on public.doctor_questions(doctor_appointment_id, created_at desc);
create index if not exists idx_medical_timeline_baby_time on public.medical_timeline_events(baby_id, occurred_at desc);

create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  next_code text;
begin
  loop
    next_code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));
    exit when not exists (
      select 1
      from public.households
      where invite_code = next_code
    );
  end loop;
  return next_code;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do update
    set email = excluded.email,
        updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.enforce_household_parent_limit()
returns trigger
language plpgsql
as $$
declare
  parent_count integer;
begin
  select count(*)
  into parent_count
  from public.household_members hm
  where hm.household_id = new.household_id
    and hm.status = 'active'
    and hm.role = 'parent'
    and (tg_op = 'INSERT' or hm.id <> new.id);

  if parent_count >= 2 then
    raise exception 'Household already has two active parents';
  end if;

  return new;
end;
$$;

drop trigger if exists household_member_parent_limit on public.household_members;
create trigger household_member_parent_limit
before insert or update on public.household_members
for each row
execute function public.enforce_household_parent_limit();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'households',
    'household_members',
    'babies',
    'sleep_sessions',
    'feeding_sessions',
    'feeding_segments',
    'diaper_events',
    'health_events',
    'symptom_events',
    'growth_measurements',
    'doctor_appointments',
    'doctor_questions',
    'medical_timeline_events'
  ]
  loop
    execute format('drop trigger if exists %I_touch_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger %I_touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

create or replace function public.is_household_member(target_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household_id
      and hm.profile_id = auth.uid()
      and hm.status = 'active'
  )
$$;

create or replace function public.assert_household_member(target_household_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_household_member(target_household_id) then
    raise exception 'Household access denied';
  end if;
end;
$$;

create or replace function public.assert_baby_in_household(target_baby_id uuid, target_household_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_household_member(target_household_id);

  if not exists (
    select 1
    from public.babies
    where id = target_baby_id
      and household_id = target_household_id
  ) then
    raise exception 'Baby does not belong to household';
  end if;
end;
$$;

create or replace function public.upsert_medical_timeline_event(
  p_household_id uuid,
  p_baby_id uuid,
  p_source_table text,
  p_source_id uuid,
  p_event_type text,
  p_occurred_at timestamptz,
  p_title text,
  p_summary text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.medical_timeline_events (
    household_id,
    baby_id,
    source_table,
    source_id,
    event_type,
    occurred_at,
    title,
    summary
  ) values (
    p_household_id,
    p_baby_id,
    p_source_table,
    p_source_id,
    p_event_type,
    p_occurred_at,
    p_title,
    p_summary
  )
  on conflict (source_table, source_id)
  do update set
    event_type = excluded.event_type,
    occurred_at = excluded.occurred_at,
    title = excluded.title,
    summary = excluded.summary,
    updated_at = timezone('utc', now());
end;
$$;

create or replace function public.app_create_household(
  p_household_id uuid,
  p_household_name text,
  p_membership_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  created_household public.households;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.households (id, name, invite_code, created_by)
  values (p_household_id, trim(p_household_name), public.generate_invite_code(), current_user_id)
  on conflict (id) do update
    set name = excluded.name,
        updated_at = timezone('utc', now())
  returning * into created_household;

  insert into public.household_members (id, household_id, profile_id, role, status)
  values (p_membership_id, created_household.id, current_user_id, 'parent', 'active')
  on conflict (household_id, profile_id) do nothing;

  return row_to_json(created_household)::jsonb;
end;
$$;

create or replace function public.app_join_household_by_code(
  p_membership_id uuid,
  p_invite_code text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_household public.households;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into target_household
  from public.households
  where invite_code = upper(trim(p_invite_code));

  if target_household.id is null then
    raise exception 'Invalid invite code';
  end if;

  insert into public.household_members (id, household_id, profile_id, role, status)
  values (p_membership_id, target_household.id, current_user_id, 'parent', 'active')
  on conflict (household_id, profile_id) do nothing;

  return row_to_json(target_household)::jsonb;
end;
$$;

create or replace function public.app_upsert_baby_profile(
  p_baby_id uuid,
  p_household_id uuid,
  p_name text,
  p_birth_date timestamptz,
  p_birth_weight numeric,
  p_birth_length numeric,
  p_client_created_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_baby public.babies;
begin
  perform public.assert_household_member(p_household_id);

  insert into public.babies (
    id,
    household_id,
    name,
    birth_date,
    birth_weight,
    birth_length,
    created_by,
    client_created_at
  ) values (
    p_baby_id,
    p_household_id,
    trim(p_name),
    p_birth_date,
    p_birth_weight,
    p_birth_length,
    current_user_id,
    p_client_created_at
  )
  on conflict (id)
  do update set
    name = excluded.name,
    birth_date = excluded.birth_date,
    birth_weight = excluded.birth_weight,
    birth_length = excluded.birth_length,
    updated_at = timezone('utc', now())
  returning * into target_baby;

  return row_to_json(target_baby)::jsonb;
end;
$$;

create or replace function public.app_start_sleep(
  p_sleep_session_id uuid,
  p_household_id uuid,
  p_baby_id uuid,
  p_start_time timestamptz,
  p_client_created_at timestamptz,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_session public.sleep_sessions;
begin
  perform public.assert_baby_in_household(p_baby_id, p_household_id);

  insert into public.sleep_sessions (
    id,
    household_id,
    baby_id,
    start_time,
    notes,
    created_by,
    client_created_at
  ) values (
    p_sleep_session_id,
    p_household_id,
    p_baby_id,
    p_start_time,
    p_notes,
    current_user_id,
    p_client_created_at
  )
  on conflict (id)
  do update set
    start_time = excluded.start_time,
    notes = excluded.notes,
    updated_at = timezone('utc', now())
  returning * into target_session;

  perform public.upsert_medical_timeline_event(
    p_household_id,
    p_baby_id,
    'sleep_sessions',
    target_session.id,
    'sleep',
    target_session.start_time,
    'Sleep session',
    case
      when target_session.end_time is null then 'In progress'
      else null
    end
  );

  return row_to_json(target_session)::jsonb;
end;
$$;

create or replace function public.app_finish_sleep(
  p_sleep_session_id uuid,
  p_household_id uuid,
  p_baby_id uuid,
  p_end_time timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_session public.sleep_sessions;
  duration_seconds integer;
begin
  perform public.assert_baby_in_household(p_baby_id, p_household_id);

  update public.sleep_sessions
  set end_time = p_end_time,
      updated_at = timezone('utc', now())
  where id = p_sleep_session_id
    and household_id = p_household_id
    and baby_id = p_baby_id
  returning * into target_session;

  if target_session.id is null then
    raise exception 'Sleep session not found';
  end if;

  duration_seconds := greatest(0, extract(epoch from (target_session.end_time - target_session.start_time))::integer);

  perform public.upsert_medical_timeline_event(
    p_household_id,
    p_baby_id,
    'sleep_sessions',
    target_session.id,
    'sleep',
    target_session.start_time,
    'Sleep session',
    concat(duration_seconds / 3600, 'h ', (duration_seconds % 3600) / 60, 'm')
  );

  return row_to_json(target_session)::jsonb;
end;
$$;

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
    case when target_session.feed_type = 'bottle' then 'Bottle feed' else 'Breastfeed' end,
    'In progress'
  );

  return row_to_json(target_session)::jsonb;
end;
$$;

create or replace function public.app_upsert_feed_segment(
  p_segment_id uuid,
  p_feeding_session_id uuid,
  p_household_id uuid,
  p_baby_id uuid,
  p_side text,
  p_started_at timestamptz,
  p_ended_at timestamptz,
  p_client_created_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_segment public.feeding_segments;
begin
  perform public.assert_baby_in_household(p_baby_id, p_household_id);

  insert into public.feeding_segments (
    id,
    household_id,
    baby_id,
    feeding_session_id,
    side,
    started_at,
    ended_at,
    created_by,
    client_created_at
  ) values (
    p_segment_id,
    p_household_id,
    p_baby_id,
    p_feeding_session_id,
    p_side,
    p_started_at,
    p_ended_at,
    current_user_id,
    p_client_created_at
  )
  on conflict (id)
  do update set
    side = excluded.side,
    started_at = excluded.started_at,
    ended_at = excluded.ended_at,
    updated_at = timezone('utc', now())
  returning * into target_segment;

  return row_to_json(target_segment)::jsonb;
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
    case when target_session.feed_type = 'bottle' then 'Bottle feed' else 'Breastfeed' end,
    case
      when target_session.feed_type = 'bottle' and target_session.bottle_amount is not null
        then concat(target_session.bottle_amount, coalesce(target_session.bottle_unit, 'ml'))
      else concat(total_seconds / 60, 'm total')
    end
  );

  return row_to_json(target_session)::jsonb;
end;
$$;

create or replace function public.app_log_diaper(
  p_diaper_event_id uuid,
  p_household_id uuid,
  p_baby_id uuid,
  p_diaper_type text,
  p_stool_color text,
  p_stool_consistency text,
  p_mucus boolean,
  p_blood boolean,
  p_urine_note text,
  p_notes text,
  p_occurred_at timestamptz,
  p_client_created_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_event public.diaper_events;
begin
  perform public.assert_baby_in_household(p_baby_id, p_household_id);

  insert into public.diaper_events (
    id,
    household_id,
    baby_id,
    diaper_type,
    stool_color,
    stool_consistency,
    mucus,
    blood,
    urine_note,
    notes,
    occurred_at,
    created_by,
    client_created_at
  ) values (
    p_diaper_event_id,
    p_household_id,
    p_baby_id,
    p_diaper_type,
    p_stool_color,
    p_stool_consistency,
    coalesce(p_mucus, false),
    coalesce(p_blood, false),
    p_urine_note,
    p_notes,
    p_occurred_at,
    current_user_id,
    p_client_created_at
  )
  on conflict (id)
  do update set
    diaper_type = excluded.diaper_type,
    stool_color = excluded.stool_color,
    stool_consistency = excluded.stool_consistency,
    mucus = excluded.mucus,
    blood = excluded.blood,
    urine_note = excluded.urine_note,
    notes = excluded.notes,
    occurred_at = excluded.occurred_at,
    updated_at = timezone('utc', now())
  returning * into target_event;

  perform public.upsert_medical_timeline_event(
    p_household_id,
    p_baby_id,
    'diaper_events',
    target_event.id,
    'diaper',
    target_event.occurred_at,
    concat(initcap(target_event.diaper_type), ' diaper'),
    nullif(concat_ws(' / ', target_event.stool_color, target_event.stool_consistency, target_event.urine_note), '')
  );

  return row_to_json(target_event)::jsonb;
end;
$$;

create or replace function public.app_log_temperature(
  p_health_event_id uuid,
  p_household_id uuid,
  p_baby_id uuid,
  p_value numeric,
  p_unit text,
  p_notes text,
  p_occurred_at timestamptz,
  p_client_created_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_event public.health_events;
begin
  perform public.assert_baby_in_household(p_baby_id, p_household_id);

  insert into public.health_events (
    id,
    household_id,
    baby_id,
    event_type,
    value_numeric,
    unit,
    notes,
    occurred_at,
    created_by,
    client_created_at
  ) values (
    p_health_event_id,
    p_household_id,
    p_baby_id,
    'temperature',
    p_value,
    p_unit,
    p_notes,
    p_occurred_at,
    current_user_id,
    p_client_created_at
  )
  on conflict (id)
  do update set
    value_numeric = excluded.value_numeric,
    unit = excluded.unit,
    notes = excluded.notes,
    occurred_at = excluded.occurred_at,
    updated_at = timezone('utc', now())
  returning * into target_event;

  perform public.upsert_medical_timeline_event(
    p_household_id,
    p_baby_id,
    'health_events',
    target_event.id,
    'temperature',
    target_event.occurred_at,
    'Temperature',
    concat(target_event.value_numeric, target_event.unit)
  );

  return row_to_json(target_event)::jsonb;
end;
$$;

create or replace function public.app_log_medication(
  p_health_event_id uuid,
  p_household_id uuid,
  p_baby_id uuid,
  p_medication_name text,
  p_dosage text,
  p_notes text,
  p_occurred_at timestamptz,
  p_client_created_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_event public.health_events;
begin
  perform public.assert_baby_in_household(p_baby_id, p_household_id);

  insert into public.health_events (
    id,
    household_id,
    baby_id,
    event_type,
    medication_name,
    dosage,
    notes,
    occurred_at,
    created_by,
    client_created_at
  ) values (
    p_health_event_id,
    p_household_id,
    p_baby_id,
    'medication',
    p_medication_name,
    p_dosage,
    p_notes,
    p_occurred_at,
    current_user_id,
    p_client_created_at
  )
  on conflict (id)
  do update set
    medication_name = excluded.medication_name,
    dosage = excluded.dosage,
    notes = excluded.notes,
    occurred_at = excluded.occurred_at,
    updated_at = timezone('utc', now())
  returning * into target_event;

  perform public.upsert_medical_timeline_event(
    p_household_id,
    p_baby_id,
    'health_events',
    target_event.id,
    'medication',
    target_event.occurred_at,
    'Medication',
    concat_ws(' ', target_event.medication_name, concat('(', target_event.dosage, ')'))
  );

  return row_to_json(target_event)::jsonb;
end;
$$;

create or replace function public.app_log_symptom(
  p_symptom_event_id uuid,
  p_household_id uuid,
  p_baby_id uuid,
  p_symptom text,
  p_notes text,
  p_occurred_at timestamptz,
  p_client_created_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_event public.symptom_events;
begin
  perform public.assert_baby_in_household(p_baby_id, p_household_id);

  insert into public.symptom_events (
    id,
    household_id,
    baby_id,
    symptom,
    notes,
    occurred_at,
    created_by,
    client_created_at
  ) values (
    p_symptom_event_id,
    p_household_id,
    p_baby_id,
    p_symptom,
    p_notes,
    p_occurred_at,
    current_user_id,
    p_client_created_at
  )
  on conflict (id)
  do update set
    symptom = excluded.symptom,
    notes = excluded.notes,
    occurred_at = excluded.occurred_at,
    updated_at = timezone('utc', now())
  returning * into target_event;

  perform public.upsert_medical_timeline_event(
    p_household_id,
    p_baby_id,
    'symptom_events',
    target_event.id,
    'symptom',
    target_event.occurred_at,
    'Symptom',
    target_event.symptom
  );

  return row_to_json(target_event)::jsonb;
end;
$$;

create or replace function public.app_log_growth(
  p_growth_measurement_id uuid,
  p_household_id uuid,
  p_baby_id uuid,
  p_weight numeric,
  p_weight_unit text,
  p_length numeric,
  p_length_unit text,
  p_notes text,
  p_occurred_at timestamptz,
  p_client_created_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_event public.growth_measurements;
begin
  perform public.assert_baby_in_household(p_baby_id, p_household_id);

  insert into public.growth_measurements (
    id,
    household_id,
    baby_id,
    weight,
    weight_unit,
    length,
    length_unit,
    notes,
    occurred_at,
    created_by,
    client_created_at
  ) values (
    p_growth_measurement_id,
    p_household_id,
    p_baby_id,
    p_weight,
    p_weight_unit,
    p_length,
    p_length_unit,
    p_notes,
    p_occurred_at,
    current_user_id,
    p_client_created_at
  )
  on conflict (id)
  do update set
    weight = excluded.weight,
    weight_unit = excluded.weight_unit,
    length = excluded.length,
    length_unit = excluded.length_unit,
    notes = excluded.notes,
    occurred_at = excluded.occurred_at,
    updated_at = timezone('utc', now())
  returning * into target_event;

  perform public.upsert_medical_timeline_event(
    p_household_id,
    p_baby_id,
    'growth_measurements',
    target_event.id,
    'growth',
    target_event.occurred_at,
    'Growth',
    trim(concat(
      case when target_event.weight is not null then concat(target_event.weight, coalesce(target_event.weight_unit, '')) else '' end,
      case when target_event.length is not null then concat(' / ', target_event.length, coalesce(target_event.length_unit, '')) else '' end
    ))
  );

  return row_to_json(target_event)::jsonb;
end;
$$;

create or replace function public.ensure_doctor_appointment(
  p_appointment_id uuid,
  p_household_id uuid,
  p_baby_id uuid,
  p_client_created_at timestamptz
)
returns public.doctor_appointments
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_appointment public.doctor_appointments;
begin
  insert into public.doctor_appointments (
    id,
    household_id,
    baby_id,
    status,
    created_by,
    client_created_at
  ) values (
    p_appointment_id,
    p_household_id,
    p_baby_id,
    'unscheduled',
    current_user_id,
    p_client_created_at
  )
  on conflict (id)
  do update set
    updated_at = timezone('utc', now())
  returning * into target_appointment;

  return target_appointment;
end;
$$;

create or replace function public.app_upsert_doctor_appointment(
  p_appointment_id uuid,
  p_household_id uuid,
  p_baby_id uuid,
  p_provider text,
  p_scheduled_at timestamptz,
  p_location text,
  p_planning_notes text,
  p_visit_notes text,
  p_status text,
  p_client_created_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_appointment public.doctor_appointments;
begin
  perform public.assert_baby_in_household(p_baby_id, p_household_id);

  insert into public.doctor_appointments (
    id,
    household_id,
    baby_id,
    provider,
    scheduled_at,
    location,
    planning_notes,
    visit_notes,
    status,
    created_by,
    client_created_at
  ) values (
    p_appointment_id,
    p_household_id,
    p_baby_id,
    p_provider,
    p_scheduled_at,
    p_location,
    p_planning_notes,
    p_visit_notes,
    p_status,
    current_user_id,
    p_client_created_at
  )
  on conflict (id)
  do update set
    provider = excluded.provider,
    scheduled_at = excluded.scheduled_at,
    location = excluded.location,
    planning_notes = excluded.planning_notes,
    visit_notes = excluded.visit_notes,
    status = excluded.status,
    updated_at = timezone('utc', now())
  returning * into target_appointment;

  perform public.upsert_medical_timeline_event(
    p_household_id,
    p_baby_id,
    'doctor_appointments',
    target_appointment.id,
    'appointment',
    coalesce(target_appointment.scheduled_at, target_appointment.created_at),
    coalesce(target_appointment.provider, 'Doctor appointment'),
    coalesce(target_appointment.location, target_appointment.planning_notes)
  );

  return row_to_json(target_appointment)::jsonb;
end;
$$;

create or replace function public.app_add_doctor_question(
  p_question_id uuid,
  p_appointment_id uuid,
  p_household_id uuid,
  p_baby_id uuid,
  p_question text,
  p_client_created_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_appointment public.doctor_appointments;
  target_question public.doctor_questions;
begin
  perform public.assert_baby_in_household(p_baby_id, p_household_id);

  target_appointment := public.ensure_doctor_appointment(
    p_appointment_id,
    p_household_id,
    p_baby_id,
    p_client_created_at
  );

  insert into public.doctor_questions (
    id,
    household_id,
    baby_id,
    doctor_appointment_id,
    question,
    created_by,
    client_created_at
  ) values (
    p_question_id,
    p_household_id,
    p_baby_id,
    target_appointment.id,
    trim(p_question),
    current_user_id,
    p_client_created_at
  )
  on conflict (id)
  do update set
    question = excluded.question,
    updated_at = timezone('utc', now())
  returning * into target_question;

  return jsonb_build_object(
    'appointment', row_to_json(target_appointment),
    'question', row_to_json(target_question)
  );
end;
$$;

create or replace function public.app_delete_doctor_question(
  p_question_id uuid,
  p_household_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_household_member(p_household_id);
  delete from public.doctor_questions
  where id = p_question_id
    and household_id = p_household_id;
end;
$$;

create or replace function public.app_add_doctor_note(
  p_appointment_id uuid,
  p_household_id uuid,
  p_baby_id uuid,
  p_note text,
  p_client_created_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_appointment public.doctor_appointments;
  next_note text;
begin
  perform public.assert_baby_in_household(p_baby_id, p_household_id);

  target_appointment := public.ensure_doctor_appointment(
    p_appointment_id,
    p_household_id,
    p_baby_id,
    p_client_created_at
  );

  next_note := trim(
    concat_ws(
      E'\n',
      nullif(target_appointment.visit_notes, ''),
      concat(to_char(timezone('utc', now()), 'YYYY-MM-DD HH24:MI'), ' ', trim(p_note))
    )
  );

  update public.doctor_appointments
  set visit_notes = next_note,
      updated_at = timezone('utc', now())
  where id = target_appointment.id
  returning * into target_appointment;

  return row_to_json(target_appointment)::jsonb;
end;
$$;

create or replace function public.app_get_bootstrap()
returns jsonb
language plpgsql
as $$
declare
  current_user_id uuid := auth.uid();
  profile_row public.profiles;
  member_rows jsonb := '[]'::jsonb;
  household_row public.households;
  baby_row public.babies;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into profile_row
  from public.profiles
  where id = current_user_id;

  select h.*
  into household_row
  from public.households h
  join public.household_members hm on hm.household_id = h.id
  where hm.profile_id = current_user_id
    and hm.status = 'active'
  order by hm.created_at asc
  limit 1;

  if household_row.id is not null then
    select coalesce(jsonb_agg(row_to_json(hm)), '[]'::jsonb)
    into member_rows
    from public.household_members hm
    where hm.household_id = household_row.id
    order by hm.joined_at asc;

    select *
    into baby_row
    from public.babies
    where household_id = household_row.id
    order by created_at asc
    limit 1;
  end if;

  return jsonb_build_object(
    'profile', row_to_json(profile_row),
    'household', case when household_row.id is null then null else row_to_json(household_row) end,
    'members', member_rows,
    'baby', case when baby_row.id is null then null else row_to_json(baby_row) end
  );
end;
$$;

create or replace function public.app_get_home_summary(p_baby_id uuid)
returns jsonb
language plpgsql
as $$
declare
  household_id_value uuid;
  active_sleep jsonb;
  active_feed jsonb;
begin
  select household_id
  into household_id_value
  from public.babies
  where id = p_baby_id;

  perform public.assert_baby_in_household(p_baby_id, household_id_value);

  select case when s.id is null then null else row_to_json(s)::jsonb end
  into active_sleep
  from public.sleep_sessions s
  where s.baby_id = p_baby_id
    and s.end_time is null
  order by s.start_time desc
  limit 1;

  select case when fs.id is null then null else jsonb_build_object(
    'id', fs.id,
    'householdId', fs.household_id,
    'babyId', fs.baby_id,
    'feedType', fs.feed_type,
    'startedAt', fs.started_at,
    'activeSide', (
      select seg.side
      from public.feeding_segments seg
      where seg.feeding_session_id = fs.id
        and seg.ended_at is null
      order by seg.started_at desc
      limit 1
    ),
    'activeSegmentId', (
      select seg.id
      from public.feeding_segments seg
      where seg.feeding_session_id = fs.id
        and seg.ended_at is null
      order by seg.started_at desc
      limit 1
    ),
    'segments', coalesce((
      select jsonb_agg(row_to_json(seg) order by seg.started_at asc)
      from public.feeding_segments seg
      where seg.feeding_session_id = fs.id
    ), '[]'::jsonb)
  ) end
  into active_feed
  from public.feeding_sessions fs
  where fs.baby_id = p_baby_id
    and fs.finished_at is null
  order by fs.started_at desc
  limit 1;

  return jsonb_build_object(
    'todaySleepSeconds', coalesce((
      select sum(greatest(0, extract(epoch from (coalesce(end_time, timezone('utc', now())) - start_time))::integer))
      from public.sleep_sessions
      where baby_id = p_baby_id
        and start_time >= date_trunc('day', timezone('utc', now()))
    ), 0),
    'todayFeedCount', coalesce((
      select count(*)
      from public.feeding_sessions
      where baby_id = p_baby_id
        and started_at >= date_trunc('day', timezone('utc', now()))
    ), 0),
    'todayDiaperCount', coalesce((
      select count(*)
      from public.diaper_events
      where baby_id = p_baby_id
        and occurred_at >= date_trunc('day', timezone('utc', now()))
    ), 0),
    'activeSleepSession', active_sleep,
    'activeFeedSession', active_feed
  );
end;
$$;

create or replace function public.app_get_medical_timeline(
  p_baby_id uuid,
  p_limit_count integer default 100
)
returns jsonb
language plpgsql
as $$
declare
  household_id_value uuid;
begin
  select household_id
  into household_id_value
  from public.babies
  where id = p_baby_id;

  perform public.assert_baby_in_household(p_baby_id, household_id_value);

  return coalesce((
    select jsonb_agg(row_to_json(mte) order by mte.occurred_at desc)
    from (
      select *
      from public.medical_timeline_events
      where baby_id = p_baby_id
      order by occurred_at desc
      limit greatest(1, p_limit_count)
    ) mte
  ), '[]'::jsonb);
end;
$$;

create or replace function public.app_get_reports_summary(
  p_baby_id uuid,
  p_window_days integer default 7
)
returns jsonb
language plpgsql
as $$
declare
  household_id_value uuid;
  window_start timestamptz := timezone('utc', now()) - make_interval(days => greatest(1, p_window_days));
begin
  select household_id
  into household_id_value
  from public.babies
  where id = p_baby_id;

  perform public.assert_baby_in_household(p_baby_id, household_id_value);

  return jsonb_build_object(
    'windowLabel', concat(p_window_days, ' days'),
    'sleepDailyAverageSeconds', coalesce((
      select round(coalesce(sum(greatest(0, extract(epoch from (coalesce(end_time, timezone('utc', now())) - start_time))::integer)), 0)::numeric / greatest(1, p_window_days))
      from public.sleep_sessions
      where baby_id = p_baby_id
        and start_time >= window_start
    ), 0),
    'feedDailyAverage', coalesce((
      select round(count(*)::numeric / greatest(1, p_window_days), 2)
      from public.feeding_sessions
      where baby_id = p_baby_id
        and started_at >= window_start
    ), 0),
    'diaperDailyAverage', coalesce((
      select round(count(*)::numeric / greatest(1, p_window_days), 2)
      from public.diaper_events
      where baby_id = p_baby_id
        and occurred_at >= window_start
    ), 0),
    'medicationCount', coalesce((
      select count(*)
      from public.health_events
      where baby_id = p_baby_id
        and event_type = 'medication'
        and occurred_at >= window_start
    ), 0),
    'symptomCount', coalesce((
      select count(*)
      from public.symptom_events
      where baby_id = p_baby_id
        and occurred_at >= window_start
    ), 0),
    'lastMedicationSummary', (
      select concat_ws(' ', medication_name, concat('(', dosage, ')'))
      from public.health_events
      where baby_id = p_baby_id
        and event_type = 'medication'
      order by occurred_at desc
      limit 1
    ),
    'latestSymptomSummary', (
      select symptom
      from public.symptom_events
      where baby_id = p_baby_id
      order by occurred_at desc
      limit 1
    ),
    'timeline', public.app_get_medical_timeline(p_baby_id, 12)
  );
end;
$$;

create or replace function public.app_get_doctor_summary(
  p_baby_id uuid,
  p_window_label text default '48h'
)
returns jsonb
language plpgsql
as $$
declare
  household_id_value uuid;
  window_start timestamptz;
  target_appointment public.doctor_appointments;
begin
  select household_id
  into household_id_value
  from public.babies
  where id = p_baby_id;

  perform public.assert_baby_in_household(p_baby_id, household_id_value);

  window_start := case p_window_label
    when '24h' then timezone('utc', now()) - interval '24 hour'
    when '7d' then timezone('utc', now()) - interval '7 day'
    else timezone('utc', now()) - interval '48 hour'
  end;

  select *
  into target_appointment
  from public.doctor_appointments
  where baby_id = p_baby_id
  order by
    case when status = 'planned' then 0 else 1 end,
    scheduled_at asc nulls last,
    created_at desc
  limit 1;

  return jsonb_build_object(
    'windowLabel', case when p_window_label in ('24h', '48h', '7d') then p_window_label else '48h' end,
    'appointment', case when target_appointment.id is null then null else row_to_json(target_appointment) end,
    'questions', coalesce((
      select jsonb_agg(row_to_json(dq) order by dq.created_at asc)
      from public.doctor_questions dq
      where dq.baby_id = p_baby_id
        and (target_appointment.id is null or dq.doctor_appointment_id = target_appointment.id)
    ), '[]'::jsonb),
    'feedSessionCount', coalesce((
      select count(*)
      from public.feeding_sessions
      where baby_id = p_baby_id
        and started_at >= window_start
    ), 0),
    'sleepTotalSeconds', coalesce((
      select sum(greatest(0, extract(epoch from (coalesce(end_time, timezone('utc', now())) - start_time))::integer))
      from public.sleep_sessions
      where baby_id = p_baby_id
        and start_time >= window_start
    ), 0),
    'diaperCounts', jsonb_build_object(
      'wet', coalesce((select count(*) from public.diaper_events where baby_id = p_baby_id and occurred_at >= window_start and diaper_type = 'wet'), 0),
      'dirty', coalesce((select count(*) from public.diaper_events where baby_id = p_baby_id and occurred_at >= window_start and diaper_type = 'dirty'), 0),
      'both', coalesce((select count(*) from public.diaper_events where baby_id = p_baby_id and occurred_at >= window_start and diaper_type = 'both'), 0)
    ),
    'temperatures', coalesce((
      select jsonb_agg(row_to_json(he) order by he.occurred_at desc)
      from public.health_events he
      where he.baby_id = p_baby_id
        and he.event_type = 'temperature'
        and he.occurred_at >= window_start
    ), '[]'::jsonb),
    'medications', coalesce((
      select jsonb_agg(row_to_json(he) order by he.occurred_at desc)
      from public.health_events he
      where he.baby_id = p_baby_id
        and he.event_type = 'medication'
        and he.occurred_at >= window_start
    ), '[]'::jsonb),
    'symptoms', coalesce((
      select jsonb_agg(row_to_json(se) order by se.occurred_at desc)
      from public.symptom_events se
      where se.baby_id = p_baby_id
        and se.occurred_at >= window_start
    ), '[]'::jsonb),
    'growthMeasurements', coalesce((
      select jsonb_agg(row_to_json(gm) order by gm.occurred_at desc)
      from public.growth_measurements gm
      where gm.baby_id = p_baby_id
        and gm.occurred_at >= window_start
    ), '[]'::jsonb),
    'timeline', public.app_get_medical_timeline(p_baby_id, 25)
  );
end;
$$;

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.babies enable row level security;
alter table public.sleep_sessions enable row level security;
alter table public.feeding_sessions enable row level security;
alter table public.feeding_segments enable row level security;
alter table public.diaper_events enable row level security;
alter table public.health_events enable row level security;
alter table public.symptom_events enable row level security;
alter table public.growth_measurements enable row level security;
alter table public.doctor_appointments enable row level security;
alter table public.doctor_questions enable row level security;
alter table public.medical_timeline_events enable row level security;

create policy "profiles_self_select"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_self_update"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "households_member_access"
on public.households
for select
to authenticated
using (public.is_household_member(id));

create policy "household_members_member_access"
on public.household_members
for select
to authenticated
using (public.is_household_member(household_id));

create policy "babies_member_access"
on public.babies
for select
to authenticated
using (public.is_household_member(household_id));

create policy "sleep_member_access"
on public.sleep_sessions
for select
to authenticated
using (public.is_household_member(household_id));

create policy "feeding_sessions_member_access"
on public.feeding_sessions
for select
to authenticated
using (public.is_household_member(household_id));

create policy "feeding_segments_member_access"
on public.feeding_segments
for select
to authenticated
using (public.is_household_member(household_id));

create policy "diaper_member_access"
on public.diaper_events
for select
to authenticated
using (public.is_household_member(household_id));

create policy "health_member_access"
on public.health_events
for select
to authenticated
using (public.is_household_member(household_id));

create policy "symptom_member_access"
on public.symptom_events
for select
to authenticated
using (public.is_household_member(household_id));

create policy "growth_member_access"
on public.growth_measurements
for select
to authenticated
using (public.is_household_member(household_id));

create policy "doctor_appointments_member_access"
on public.doctor_appointments
for select
to authenticated
using (public.is_household_member(household_id));

create policy "doctor_questions_member_access"
on public.doctor_questions
for select
to authenticated
using (public.is_household_member(household_id));

create policy "timeline_member_access"
on public.medical_timeline_events
for select
to authenticated
using (public.is_household_member(household_id));

revoke usage on schema public from public;
grant usage on schema public to authenticated;
grant select on all tables in schema public to authenticated;
revoke execute on all functions in schema public from public;
alter default privileges in schema public revoke execute on functions from public;
grant execute on function public.is_household_member(uuid) to authenticated;
grant execute on function
  public.app_create_household(uuid, text, uuid),
  public.app_join_household_by_code(uuid, text),
  public.app_upsert_baby_profile(uuid, uuid, text, timestamptz, numeric, numeric, timestamptz),
  public.app_start_sleep(uuid, uuid, uuid, timestamptz, timestamptz, text),
  public.app_finish_sleep(uuid, uuid, uuid, timestamptz),
  public.app_start_feed_session(uuid, uuid, uuid, text, timestamptz, timestamptz),
  public.app_upsert_feed_segment(uuid, uuid, uuid, uuid, text, timestamptz, timestamptz, timestamptz),
  public.app_finish_feed_session(uuid, uuid, uuid, timestamptz, text, boolean, boolean, boolean, boolean, numeric, text),
  public.app_log_diaper(uuid, uuid, uuid, text, text, text, boolean, boolean, text, text, timestamptz, timestamptz),
  public.app_log_temperature(uuid, uuid, uuid, numeric, text, text, timestamptz, timestamptz),
  public.app_log_medication(uuid, uuid, uuid, text, text, text, timestamptz, timestamptz),
  public.app_log_symptom(uuid, uuid, uuid, text, text, timestamptz, timestamptz),
  public.app_log_growth(uuid, uuid, uuid, numeric, text, numeric, text, text, timestamptz, timestamptz),
  public.app_upsert_doctor_appointment(uuid, uuid, uuid, text, timestamptz, text, text, text, text, timestamptz),
  public.app_add_doctor_question(uuid, uuid, uuid, uuid, text, timestamptz),
  public.app_delete_doctor_question(uuid, uuid),
  public.app_add_doctor_note(uuid, uuid, uuid, text, timestamptz),
  public.app_get_bootstrap(),
  public.app_get_home_summary(uuid),
  public.app_get_medical_timeline(uuid, integer),
  public.app_get_reports_summary(uuid, integer),
  public.app_get_doctor_summary(uuid, text)
to authenticated;
