-- referrals sequence and auto code/link generation
create sequence if not exists referrals_seq;

alter table public.referrals
  add column if not exists link text,
  add column if not exists code text unique,
  add column if not exists users_today integer default 0,
  add column if not exists total_users integer default 0,
  add column if not exists status text default 'active';

create or replace function public.fn_referral_autofill()
returns trigger
language plpgsql
as $$
begin
  if new.code is null or length(new.code) = 0 then
    new.code := 'ref_' || lpad(nextval('referrals_seq')::text, 2, '0');
  end if;
  if new.link is null or length(new.link) = 0 then
    new.link := '/' || new.code;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_referral_autofill on public.referrals;
create trigger trg_referral_autofill
before insert on public.referrals
for each row
execute function public.fn_referral_autofill();

-- foreign keys
alter table public.payments
  add column if not exists agent_id uuid references public.referrals(id);

alter table public.users
  add column if not exists agent_id uuid references public.referrals(id);

-- counters increment on successful payment
create or replace function public.fn_referral_increment()
returns trigger
language plpgsql
as $$
begin
  if new.agent_id is not null then
    update public.referrals
      set users_today = coalesce(users_today,0) + 1,
          total_users = coalesce(total_users,0) + 1
      where id = new.agent_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_referral_increment on public.payments;
create trigger trg_referral_increment
after insert on public.payments
for each row
execute function public.fn_referral_increment();

