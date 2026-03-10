"use client";

import { useEffect, useRef, useState } from "react";

const EXAMPLE_PROMPTS = [
  "دعوة تخرج ذهبية",
  "دعوة زواج فخمة",
  "دعوة خطوبة بسيطة",
  "دعوة عقيقة طفل",
  "دعوة حفلة عيد ميلاد"
];

const STYLES = [
  "أسلوب فاخر ذهبي",
  "أسلوب بسيط (Minimal)",
  "إطار زهور ناعمة",
  "نقوش إسلامية هندسية",
  "أسلوب عربي حديث"
];

type Props = {
  loading: boolean;
  onGenerate: (prompt: string, style?: string) => void;
  onDownloadPreview: () => void;
  onDownloadHd: () => void;
  errorMessage?: string | null;
  cooldownSeconds?: number;
  onRetry?: () => void;
  canRetry?: boolean;
  externalPrompt?: string | null;
};

export function PromptPanel({
  loading,
  onGenerate,
  onDownloadPreview,
  onDownloadHd,
  errorMessage,
  cooldownSeconds = 0,
  onRetry,
  canRetry = false,
  externalPrompt
}: Props) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<string | undefined>();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!externalPrompt) return;
    setPrompt(externalPrompt);
    onGenerate(externalPrompt, style);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalPrompt]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    onGenerate(prompt, style);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <div className="mb-2 text-sm font-semibold">
          1. اكتب وصف الدعوة
        </div>
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="مثال: دعوة تخرج ذهبية بسيطة مع زهور خفيفة"
          className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-0 min-h-[88px]"
          dir="rtl"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!loading) {
                handleGenerate();
              }
            }
          }}
        />
        <div className="mt-2 space-y-1">
          <div className="text-[11px] text-slate-400">أمثلة جاهزة:</div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrompt(p)}
                className="cursor-pointer rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-[11px] hover:border-primary hover:bg-primary/10"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-300">
          أسلوب التصميم (اختياري)
        </div>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => {
            const active = s === style;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStyle(active ? undefined : s)}
                className={`cursor-pointer rounded-full border px-3 py-1 text-[11px] transition ${
                  active
                    ? "border-primary bg-primary/10"
                    : "border-slate-800 bg-slate-900/60 hover:border-primary hover:bg-primary/10"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto space-y-2 pt-4 border-t border-slate-900">
        {errorMessage && (
          <div className="rounded-lg bg-red-900/30 border border-red-700/60 px-3 py-2 text-xs text-red-100">
            Something went wrong. Please try again.
            {canRetry && onRetry && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={onRetry}
                  className="rounded-lg border border-red-400/70 bg-red-500/10 px-3 py-1 text-[11px] hover:bg-red-500/20"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || cooldownSeconds > 0}
          className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {loading
            ? "جاري التوليد..."
            : cooldownSeconds > 0
            ? `انتظر ${cooldownSeconds} ث`
            : "توليد الخلفية"}
        </button>

        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={onDownloadPreview}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 hover:border-primary"
          >
            تحميل معاينة (مجاني)
          </button>
          <button
            type="button"
            onClick={onDownloadHd}
            className="flex-1 rounded-xl border border-amber-500/70 bg-amber-500/10 px-3 py-2 text-amber-100 hover:bg-amber-500/20"
          >
            تحميل عالي الدقة $4.99
          </button>
        </div>
      </div>
    </div>
  );
}

