import { createClient } from "@supabase/supabase-js";

export function supabaseServer() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase URL or Service Role Key not configured");
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}