import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/lib/supabase-result";

export async function fetchNotifications() {
  return unwrap(
    await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
  );
}

export async function notify(
  userId: string,
  type: string,
  title: string,
  body: string,
  link: string,
  dedupeKey?: string,
) {
  await supabase
    .from("notifications")
    .insert({ user_id: userId, type, title, body, link, dedupe_key: dedupeKey ?? null });
}
