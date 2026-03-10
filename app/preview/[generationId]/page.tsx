import { supabase } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

type Props = {
  params: {
    generationId: string;
  };
};

async function fetchGeneration(generationId: string) {
  if (!generationId) return null;

  const { data } = await supabase
    .from("generations")
    .select("id, image_url, prompt, created_at")
    .eq("id", generationId)
    .single();

  return data as
    | { id: string; image_url: string | null; prompt: string | null; created_at: string }
    | null;
}

export async function generateMetadata({
  params
}: Props): Promise<Metadata> {
  const generation = await fetchGeneration(params.generationId);

  if (!generation || !generation.image_url) {
    return {
      title: "الدعوة غير موجودة"
    };
  }

  return {
    title: "دعوة خاصة",
    openGraph: {
      title: "دعوة خاصة",
      type: "website",
      images: [
        {
          url: generation.image_url
        }
      ]
    }
  };
}

export default async function PreviewPage({ params }: Props) {
  const generation = await fetchGeneration(params.generationId);

  if (!generation || !generation.image_url) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-5 text-center text-sm">
          الدعوة غير موجودة
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="text-sm tracking-wide text-slate-300">دعوة</div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-3 shadow-xl">
          <div className="overflow-hidden rounded-2xl bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generation.image_url}
              alt={generation.prompt ?? "دعوة"}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 text-xs">
          <a
            href={generation.image_url}
            download
            className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-50 hover:border-primary hover:bg-primary/10"
          >
            تحميل الصورة
          </a>
          <Link
            href="/editor"
            className="w-full rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
          >
            صمّم دعوتك الخاصة
          </Link>
        </div>
      </div>
    </div>
  );
}

