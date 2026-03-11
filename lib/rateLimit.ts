import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function checkRateLimit(ip: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_ip: ip
  });

  if (error) {
    throw new Error("Rate limit check failed");
  }

  return data === true;
}


