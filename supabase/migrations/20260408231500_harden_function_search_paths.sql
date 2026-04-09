alter function public.touch_updated_at() set search_path = '';

alter function public.app_current_user_id() set search_path = '';

create or replace function public.generate_invite_code()
returns text
language plpgsql
set search_path = ''
as $$
declare
  next_code text;
begin
  loop
    next_code := upper(substring(replace(extensions.gen_random_uuid()::text, '-', '') from 1 for 8));
    exit when not exists (
      select 1
      from public.households
      where invite_code = next_code
    );
  end loop;
  return next_code;
end;
$$;

alter function public.enforce_household_parent_limit() set search_path = '';

alter function public.app_get_bootstrap() set search_path = '';

alter function public.app_get_home_summary(uuid) set search_path = '';

alter function public.app_get_medical_timeline(uuid, integer) set search_path = '';

alter function public.app_get_reports_summary(uuid, integer) set search_path = '';

alter function public.app_get_doctor_summary(uuid, text) set search_path = '';
