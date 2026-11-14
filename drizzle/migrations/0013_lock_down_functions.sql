-- Final hardening: signed-out visitors can't run any of the app's database functions, except the one the
-- invitation page needs before sign-in. Run once in the Supabase SQL editor, after 0012. Safe to run again.
--
-- Postgres lets everyone run a new function unless that is switched off. Earlier migrations switched it off one
-- function at a time; create_team (and anything added later by mistake) was missed. This closes them all in one
-- pass: every function that runs with elevated rights is limited to signed-in students.
DO $$
DECLARE f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef
      AND p.prorettype <> 'trigger'::regtype
      AND p.proname <> 'invitation_preview'   -- an invitation link is looked up before the student signs in
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM public, anon', f.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', f.sig);
  END LOOP;
END $$;
