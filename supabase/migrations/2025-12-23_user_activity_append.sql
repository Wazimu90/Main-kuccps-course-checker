create or replace function public.fn_append_user_activity(
  p_email text,
  p_ts timestamptz,
  p_type text,
  p_metadata jsonb
) returns void
language plpgsql
as $$
begin
  update public.users
  set activity = coalesce(activity, '[]'::jsonb) || jsonb_build_array(jsonb_build_object('ts', p_ts, 'type', p_type, 'metadata', p_metadata)),
      updated_at = now()
  where email = p_email;
end;
$$;

