import "server-only";
import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false
    }
  }
);

export async function uploadGeneratedImage(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, "base64");

  const fileName = `generated/${new Date()
    .toISOString()
    .slice(0, 10)}/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;

  const { error } = await supabase.storage
    .from("generated-images")
    .upload(fileName, buffer, {
      contentType: "image/png",
      upsert: false,
      metadata: {
        source: "dawati-ai",
        created_at: new Date().toISOString()
      }
    });

  if (error) {
    throw new Error("Failed to upload generated image");
  }

  const { data } = supabase.storage
    .from("generated-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

