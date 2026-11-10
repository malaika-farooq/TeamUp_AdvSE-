CREATE OR REPLACE FUNCTION public.shares_team_with(_other uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members a
    JOIN public.team_members b ON b.team_id = a.team_id
    WHERE a.user_id = _user AND b.user_id = _other
  );
$$;
REVOKE ALL ON FUNCTION public.shares_team_with(uuid, uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.shares_team_with(uuid, uuid) TO authenticated;

CREATE POLICY "teammate profiles read" ON public.profiles FOR SELECT TO authenticated
  USING (public.shares_team_with(id, auth.uid()));