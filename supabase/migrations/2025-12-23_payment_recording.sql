alter table public.users add column if not exists activity jsonb default '[]'::jsonb;

create unique index if not exists users_email_unique on public.users (email);
create index if not exists idx_users_activity_gin on public.users using gin (activity);

create index if not exists idx_payments_email on public.payments (email);
create index if not exists idx_payments_phone on public.payments (phone_number);
create index if not exists idx_payments_paid_at on public.payments (paid_at);
create index if not exists idx_payments_agent_id on public.payments (agent_id);

create or replace function public.fn_record_payment_and_update_user(
  p_name text,
  p_email text,
  p_phone text,
  p_amount numeric,
  p_ip text,
  p_course_category text,
  p_agent_id uuid,
  p_paid_at timestamptz,
  p_metadata jsonb
) returns table(payment_id uuid)
language plpgsql
as $$
declare
  pid uuid;
begin
  if coalesce(p_name,'')='' or coalesce(p_email,'')='' or coalesce(p_phone,'')='' or p_amount is null then
    raise exception 'invalid_input';
  end if;

  insert into public.payments(name,email,phone_number,amount,ip_address,course_category,agent_id,paid_at)
  values(p_name,p_email,p_phone,p_amount,p_ip,p_course_category,p_agent_id,p_paid_at)
  returning id into pid;

  insert into public.users(name,email,phone_number,ip_address,course_category,agent_id,status,created_at,updated_at,activity)
  values(p_name,p_email,p_phone,p_ip,p_course_category,p_agent_id,'active',now(),now(), jsonb_build_array(jsonb_build_object('ts', p_paid_at, 'type','payment','metadata', p_metadata)))
  on conflict(email) do update set
    name=excluded.name,
    phone_number=excluded.phone_number,
    ip_address=excluded.ip_address,
    course_category=excluded.course_category,
    agent_id=excluded.agent_id,
    updated_at=now(),
    activity = coalesce(public.users.activity,'[]'::jsonb) || jsonb_build_array(jsonb_build_object('ts', p_paid_at, 'type','payment','metadata', p_metadata));

  insert into public.activity_logs(event_type,description,ip_address,email,phone_number,device,location,actor_role,created_at)
  values('payment_completed','Payment completed',p_ip,p_email,p_phone,null,null,'user',p_paid_at);

  return query select pid;
exception when others then
  insert into public.activity_logs(event_type,description,ip_address,email,phone_number,device,location,actor_role,created_at)
  values('payment_recording_failed', sqlerrm, p_ip, p_email, p_phone, null, null, 'system', now());
  raise;
end;
$$;

