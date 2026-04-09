create or replace function public.app_get_bootstrap()
returns jsonb
language plpgsql
set search_path = ''
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
    select coalesce(jsonb_agg(row_to_json(hm) order by hm.joined_at asc), '[]'::jsonb)
    into member_rows
    from public.household_members hm
    where hm.household_id = household_row.id;

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
