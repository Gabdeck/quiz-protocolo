import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let leadClient: SupabaseClient | undefined;

export function getSupabaseLeadClient() {
  if (leadClient) return leadClient;

  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    throw new Error("Supabase lead capture is not configured.");
  }

  leadClient = createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  return leadClient;
}
