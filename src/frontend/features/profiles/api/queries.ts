import { supabase } from "@/integrations/supabase/client";

export async function fetchProfile(userId: string) {
  const res = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (res.error) throw new Error(res.error.message);
  return res.data;
}
