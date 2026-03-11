import "server-only";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "generated-images";
const MAX_AGE_DAYS = 30;
const DATE_FOLDER_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function cleanupGeneratedImages() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    // eslint-disable-next-line no-console
    console.warn("Cleanup skipped: Supabase not configured");
    return;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  const { data: folders, error } = await supabase.storage
    .from(BUCKET)
    .list("generated");

  if (error) {
    throw new Error("Failed to list generated folders");
  }

  for (const folder of folders ?? []) {
    const name = folder.name;

    // Skip non-date folders
    if (!DATE_FOLDER_REGEX.test(name)) {
      continue;
    }

    const folderDate = new Date(name).getTime();

    if (!folderDate || folderDate > cutoff) {
      continue;
    }

    const { data: files } = await supabase.storage
      .from(BUCKET)
      .list(`generated/${name}`);

    const paths =
      files?.map((file) => `generated/${name}/${file.name}`) ?? [];

    if (paths.length > 0) {
      const CHUNK_SIZE = 100;
      const chunks: string[][] = [];

      for (let i = 0; i < paths.length; i += CHUNK_SIZE) {
        chunks.push(paths.slice(i, i + CHUNK_SIZE));
      }

      const MAX_CONCURRENCY = 5;
      const queue = [...chunks];
      const workers: Promise<void>[] = [];

      async function worker() {
        while (queue.length > 0) {
          const chunk = queue.shift();
          if (!chunk) return;

          await supabase.storage.from(BUCKET).remove(chunk);
        }
      }

      for (let i = 0; i < MAX_CONCURRENCY; i++) {
        workers.push(worker());
      }

      await Promise.all(workers);
    }
  }
}

