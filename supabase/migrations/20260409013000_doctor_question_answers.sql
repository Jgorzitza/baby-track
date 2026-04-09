alter table public.doctor_questions
add column if not exists answered_at timestamptz,
add column if not exists answer_notes text;

create or replace function public.app_answer_doctor_question(
  p_question_id uuid,
  p_household_id uuid,
  p_answered boolean,
  p_answer_notes text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_question public.doctor_questions;
begin
  perform public.assert_household_member(p_household_id);

  update public.doctor_questions
  set answered_at = case when p_answered then timezone('utc', now()) else null end,
      answer_notes = nullif(trim(coalesce(p_answer_notes, '')), ''),
      updated_at = timezone('utc', now())
  where id = p_question_id
    and household_id = p_household_id
  returning * into target_question;

  if target_question.id is null then
    raise exception 'Doctor question not found';
  end if;

  return row_to_json(target_question)::jsonb;
end;
$$;

revoke all on function public.app_answer_doctor_question(uuid, uuid, boolean, text) from public;
grant execute on function public.app_answer_doctor_question(uuid, uuid, boolean, text) to authenticated;
