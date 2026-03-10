"use client";

import { useCallback, useEffect, useState } from "react";
import { CanvasEditor } from "@/components/CanvasEditor";
import { PromptPanel } from "@/components/PromptPanel";
import { SizeSelector } from "@/components/SizeSelector";
import { SIZE_PRESETS, SizePreset, SizePresetId } from "@/lib/supabase";
import { enhancePrompt } from "@/lib/promptEnhancer";
import { EventDetailsPanel, EventDetails } from "@/components/EventDetailsPanel";
import { TextStylePanel } from "@/components/TextStylePanel";
import { ThemeSelector, ThemeConfig, ThemeId } from "@/components/ThemeSelector";
import { VariationModal } from "@/components/VariationModal";

type Generation = {
  id: string;
  parentId?: string | null;
  prompt: string;
  imageUrl: string;
  thumbnailUrl?: string;
};

const DEFAULT_EVENT_DETAILS: EventDetails = {
  eventType: "حفل تخرج",
  mainTitle: "يسرّنا دعوتكم",
  names: "محمد & فاطمة",
  date: "15 يونيو 2026",
  day: "الجمعة",
  time: "8:00 مساءً",
  location: "قاعة الندى",
  extraPhrase: "حضوركم يشرفنا"
};

export default function EditorPage() {
  const [sizePreset, setSizePreset] = useState<SizePreset>(SIZE_PRESETS[1]);
  const [fontFamily, setFontFamily] = useState<string>("Cairo");
  const [loading, setLoading] = useState(false);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<EventDetails>(DEFAULT_EVENT_DETAILS);
  const [theme, setTheme] = useState<ThemeId | null>(null);
  const [variationModalOpen, setVariationModalOpen] = useState(false);
  const [variationDirection, setVariationDirection] = useState<
    "top" | "bottom" | "left" | "right" | null
  >(null);
  const [hdUnlocked, setHdUnlocked] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [paidFormat, setPaidFormat] = useState<"png" | "jpg" | "pdf">("png");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [lastRequest, setLastRequest] = useState<{
    prompt: string;
    style?: string;
    parentId?: string | null;
    variation?: boolean;
  } | null>(null);
  const [externalPrompt, setExternalPrompt] = useState<string | null>(null);

  const activeGeneration = generations.find((g) => g.id === activeGenerationId);

  // Local persistence
  useEffect(() => {
    const stored = window.localStorage.getItem("dawati-editor-state");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as {
        sizePresetId?: SizePresetId;
        fontFamily?: string;
        themeId?: ThemeId | null;
        eventDetails?: EventDetails;
        lastGeneration?: Generation;
      };
      if (parsed.sizePresetId) {
        const found = SIZE_PRESETS.find((p) => p.id === parsed.sizePresetId);
        if (found) setSizePreset(found);
      }
      if (parsed.fontFamily) setFontFamily(parsed.fontFamily);
      if (parsed.themeId) setTheme(parsed.themeId);
      if (parsed.eventDetails) setEventDetails(parsed.eventDetails);
      if (parsed.lastGeneration) {
        setGenerations([parsed.lastGeneration]);
        setActiveGenerationId(parsed.lastGeneration.id);
        void callCanvas((handle) =>
          handle.setBackground(parsed.lastGeneration.imageUrl)
        );
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const payload = {
      sizePresetId: sizePreset.id,
      fontFamily,
      themeId: theme,
      eventDetails,
      lastGeneration: activeGeneration
    };
    window.localStorage.setItem("dawati-editor-state", JSON.stringify(payload));
  }, [sizePreset.id, fontFamily, theme, eventDetails, activeGeneration]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const id = window.setInterval(
      () => setCooldownSeconds((s) => Math.max(0, s - 1)),
      1000
    );
    return () => window.clearInterval(id);
  }, [cooldownSeconds]);

  const preloadImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

  const createThumbnail = (img: HTMLImageElement): string => {
    const canvas = document.createElement("canvas");
    const targetWidth = 300;
    const scale = targetWidth / img.width;
    const targetHeight = img.height * scale;
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return img.src;
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    return canvas.toDataURL("image/jpeg", 0.7);
  };

  const callCanvas = useCallback(
    async (fn: (handle: any) => Promise<void> | void) => {
      const handle = (globalThis as any).__canvasEditorHandle;
      if (!handle) return;
      await fn(handle);
    },
    []
  );

  const handleGenerate = async (
    prompt: string,
    style?: string,
    parentId?: string | null,
    variation = false
  ) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setCooldownSeconds(3);
      setLastRequest({ prompt, style, parentId, variation });

      const decoratedPrompt = variation
        ? `${prompt} ، نسخة مختلفة مع توزيع مختلف للعناصر`
        : prompt;

      const enhanced = enhancePrompt(decoratedPrompt, style);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: enhanced,
          width: sizePreset.width,
          height: sizePreset.height
        })
      });
      if (!res.ok) {
        throw new Error("failed-generate");
      }
      const data = await res.json();
      const imageUrl: string = data.imageUrl;

      const preloaded = await preloadImage(imageUrl);
      const thumbnailUrl = createThumbnail(preloaded);

      const saveRes = await fetch("/api/save-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          imageUrl,
          parentGenerationId: parentId ?? null,
          sizePresetId: sizePreset.id as SizePresetId
        })
      });
      if (!saveRes.ok) {
        setErrorMessage("Something went wrong. Please try again.");
        return;
      }

      const saveJson = (await saveRes.json()) as { id?: string };
      const generationId = saveJson.id ?? crypto.randomUUID();

      const gen: Generation = {
        id: generationId,
        parentId,
        prompt,
        imageUrl,
        thumbnailUrl
      };
      setGenerations((prev) => [...prev, gen]);
      setActiveGenerationId(gen.id);

      await callCanvas((handle) => handle.setBackground(imageUrl));
    } catch (e) {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBranch = async (direction: "top" | "bottom" | "left" | "right") => {
    if (!activeGeneration) return;
    setVariationDirection(direction);
    setVariationModalOpen(true);
  };

  const downloadBlob = async (blob: Blob | null, filename: string) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPreview = async () => {
    await callCanvas(async (handle) => {
      const blob = await handle.exportWithWatermark();
      if (!blob) {
        setErrorMessage("Something went wrong. Please try again.");
        return;
      }
      await downloadBlob(blob, "invite-preview.png");
    });
  };

  const handleDownloadHd = async () => {
    if (!hdUnlocked) {
      const link = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
      if (!link) {
        // eslint-disable-next-line no-alert
        alert("Stripe payment link is not configured.");
        return;
      }
      window.open(link, "_blank");
      setHdUnlocked(true);
      return;
    }

    await callCanvas(async (handle) => {
      const blob = await handle.exportClean();
      if (!blob) {
        setErrorMessage("Something went wrong. Please try again.");
        return;
      }

      if (paidFormat === "pdf") {
        const imgUrl = URL.createObjectURL(blob);
        const win = window.open("", "_blank");
        if (!win) return;
        win.document.write(
          `<html><body style="margin:0"><img src="${imgUrl}" style="width:100%;height:auto;"/></body></html>`
        );
      } else {
        const ext = paidFormat === "jpg" ? "jpg" : "png";
        const downloadBlob = new Blob([blob], {
          type: paidFormat === "jpg" ? "image/jpeg" : "image/png"
        });
        const url = URL.createObjectURL(downloadBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invite-hd.${ext}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    });
  };

  const handleFontChange = async (font: string) => {
    setFontFamily(font);
    await callCanvas((handle) => handle.setFontForText(font));
  };

  const applyDetailsToCanvas = async () => {
    await callCanvas((handle) => handle.applyInvitationText(eventDetails));
  };

  const handleThemeChange = async (cfg: ThemeConfig) => {
    setTheme(cfg.id);
    await callCanvas((handle) => handle.setFillColorForText(cfg.textColor));
  };

  const handleCopyShareLink = async () => {
    if (!activeGeneration) return;
    const origin = window.location.origin;
    const shareUrl = `${origin}/preview/${activeGeneration.id}`;
    await navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleVariationConfirm = async (description: string) => {
    if (!activeGeneration) return;
    setVariationModalOpen(false);
    await handleGenerate(
      `${activeGeneration.prompt}. ${description}`,
      undefined,
      activeGeneration.id,
      true
    );
  };

  const handleSelectGeneration = async (gen: Generation) => {
    setActiveGenerationId(gen.id);
    await callCanvas((handle) => handle.setBackground(gen.imageUrl));
  };

  const handleGenerateVariation = async () => {
    if (!activeGeneration) return;
    await handleGenerate(activeGeneration.prompt, undefined, activeGeneration.id, true);
  };

  const handleResetDesign = useCallback(() => {
    setGenerations([]);
    setActiveGenerationId(null);
    setErrorMessage(null);
    setLastRequest(null);
    setExternalPrompt(null);
    setEventDetails(DEFAULT_EVENT_DETAILS);
    callCanvas((handle) => handle.clearCanvas());
  }, [callCanvas]);

  const handleRegenerateBackground = async () => {
    if (!activeGeneration) return;
    try {
      setLoading(true);
      setErrorMessage(null);

      const enhanced = enhancePrompt(activeGeneration.prompt);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: enhanced,
          width: sizePreset.width,
          height: sizePreset.height
        })
      });
      if (!res.ok) throw new Error("failed-generate");

      const data = await res.json();
      const imageUrl: string = data.imageUrl;

      const preloaded = await preloadImage(imageUrl);
      const thumbnailUrl = createThumbnail(preloaded);

      const saveRes = await fetch("/api/save-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: activeGeneration.prompt,
          imageUrl,
          parentGenerationId: activeGeneration.id,
          sizePresetId: sizePreset.id as SizePresetId
        })
      });

      if (!saveRes.ok) {
        setErrorMessage("Something went wrong. Please try again.");
        return;
      }

      const saveJson = (await saveRes.json()) as { id?: string };
      const generationId = saveJson.id ?? crypto.randomUUID();

      const gen: Generation = {
        id: generationId,
        parentId: activeGeneration.id,
        prompt: activeGeneration.prompt,
        imageUrl,
        thumbnailUrl
      };
      setGenerations((prev) => [...prev, gen]);
      setActiveGenerationId(gen.id);

      await callCanvas((handle) => handle.setBackgroundOnly(imageUrl));
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mx-auto flex h-[calc(100vh-56px)] max-w-6xl gap-4 px-4 py-4 flex-col lg:flex-row">
        <div className="lg:flex-[0.7] flex flex-col gap-3 w-full">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleResetDesign}
              className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-800/70"
            >
              بدء تصميم جديد
            </button>
          </div>
          <div className="flex-1">
            <div className="mb-2 text-sm font-semibold">
              3. حرّر نص الدعوة على الخلفية
            </div>
            <div className="relative h-full">
              <CanvasEditor
                sizePreset={sizePreset}
                onBranchRequest={handleBranch}
                loading={loading}
              />
              {generations.length === 0 && (
                <div className="absolute inset-4 z-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/80 text-center">
                  <div className="mb-2 text-sm font-semibold">
                    صمّم دعوتك في ثوانٍ
                  </div>
                  <div className="mb-3 text-xs text-slate-300 max-w-sm">
                    1. اكتب وصف الدعوة
                    <br />
                    2. اضغط إنشاء
                    <br />
                    3. عدّل النص
                    <br />
                    4. حمّل الدعوة
                  </div>
                  <div className="mt-2 flex flex-wrap justify-center gap-2 text-[11px] text-slate-200">
                    {[
                      "دعوة تخرج ذهبية",
                      "دعوة زواج فخمة",
                      "دعوة خطوبة بسيطة"
                    ].map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => setExternalPrompt(example)}
                        className="rounded-full border border-slate-700 px-3 py-1 hover:border-primary hover:bg-primary/10"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {generations.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="text-xs font-semibold text-slate-300">
                سجل التصاميم
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {generations.map((gen, idx) => {
                  const isActive = gen.id === activeGenerationId;
                  return (
                    <button
                      key={gen.id}
                      type="button"
                      onClick={() => handleSelectGeneration(gen)}
                      className={`min-w-[90px] max-w-[110px] rounded-xl border bg-slate-900/70 p-1 text-[10px] text-right ${
                        isActive
                          ? "border-primary"
                          : "border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      <div className="mb-1 h-14 w-full overflow-hidden rounded-lg bg-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={gen.thumbnailUrl || gen.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="font-semibold">تصميم {idx + 1}</div>
                      {gen.parentId && (
                        <div className="text-[9px] text-slate-400">
                          نسخة من تصميم سابق
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRegenerateBackground}
              disabled={loading || !activeGeneration}
              className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-medium text-slate-100 hover:border-primary hover:bg-primary/10 disabled:opacity-50"
            >
              تغيير الخلفية
            </button>
            <button
              type="button"
              onClick={handleGenerateVariation}
              disabled={loading || !activeGeneration}
              className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-medium text-slate-100 hover:border-primary hover:bg-primary/10 disabled:opacity-50"
            >
              ✨ Generate another version
            </button>
          </div>
        </div>

        <div className="lg:flex-[0.3] flex flex-col gap-3 w-full">
          <PromptPanel
            loading={loading}
            onGenerate={handleGenerate}
            onDownloadPreview={handleDownloadPreview}
            onDownloadHd={handleDownloadHd}
            errorMessage={errorMessage}
            cooldownSeconds={cooldownSeconds}
            onRetry={
              lastRequest
                ? () =>
                    handleGenerate(
                      lastRequest.prompt,
                      lastRequest.style,
                      lastRequest.parentId,
                      lastRequest.variation
                    )
                : undefined
            }
            canRetry={!!lastRequest}
            externalPrompt={externalPrompt}
          />
          <EventDetailsPanel
            value={eventDetails}
            onChange={setEventDetails}
            onApplyToCanvas={applyDetailsToCanvas}
          />
          <SizeSelector
            value={sizePreset.id}
            onChange={(preset) => {
              setSizePreset(preset);
            }}
          />
          <TextStylePanel
            fontFamily={fontFamily}
            onFontFamilyChange={handleFontChange}
            onFontSizeChange={(size) =>
              callCanvas((handle) => handle.setFontSizeForText(size))
            }
            onColorChange={(color) =>
              callCanvas((handle) => handle.setFillColorForText(color))
            }
            onAlignChange={(align) =>
              callCanvas((handle) => handle.setTextAlignForText(align))
            }
            onLineSpacingChange={(value) =>
              callCanvas((handle) => handle.setLineSpacingForText(value))
            }
          />
          <ThemeSelector value={theme} onChange={handleThemeChange} />

          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-3 text-xs">
            <div className="text-sm font-semibold mb-1">التصدير</div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={handleDownloadPreview}
                className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-left hover:border-primary"
              >
                <div className="font-semibold text-sm">
                  تحميل معاينة مجانية
                </div>
                <div className="text-[11px] text-slate-300">
                  PNG • تحتوي على علامة مائية
                </div>
              </button>

              <div className="rounded-xl border border-amber-500/70 bg-amber-500/5 px-3 py-2">
                <div className="mb-1 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">
                      تحميل نسخة عالية الجودة
                    </div>
                    <div className="text-[11px] text-amber-100/90">
                      بدون علامة مائية • جودة عالية
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-200">
                    $4.99
                  </span>
                </div>

                <div className="mb-2 flex gap-1 text-[10px]">
                  {["png", "jpg", "pdf"].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() =>
                        setPaidFormat(fmt as "png" | "jpg" | "pdf")
                      }
                      className={`flex-1 rounded-full border px-2 py-1 ${
                        paidFormat === fmt
                          ? "border-amber-400 bg-amber-500/20 text-amber-50"
                          : "border-amber-500/40 bg-transparent text-amber-100/80"
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleDownloadHd}
                  className="w-full rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-black hover:bg-amber-400"
                >
                  {hdUnlocked
                    ? "تحميل النسخة عالية الجودة"
                    : "إتمام الدفع وفتح التحميل"}
                </button>
                {hdUnlocked && (
                  <div className="mt-1 text-[11px] text-amber-100">
                    تم فتح النسخة عالية الجودة
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-3 text-xs">
            <div className="text-sm font-semibold mb-1">مشاركة</div>
            {activeGeneration && (
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 p-2">
                <div className="h-12 w-16 overflow-hidden rounded-lg bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeGeneration.thumbnailUrl || activeGeneration.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 text-[11px] text-right">
                  <div className="font-semibold">رابط معاينة التصميم</div>
                  <div className="text-slate-400">
                    تصميم {generations.findIndex((g) => g.id === activeGeneration.id) + 1}
                  </div>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={handleCopyShareLink}
              disabled={!activeGeneration}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs hover:border-primary disabled:opacity-60"
            >
              نسخ رابط المعاينة
            </button>
            {shareCopied && (
              <div className="text-[11px] text-teal-200">تم نسخ الرابط</div>
            )}
          </div>
        </div>
      </div>

      <VariationModal
        open={variationModalOpen}
        onConfirm={handleVariationConfirm}
        onClose={() => setVariationModalOpen(false)}
      />
    </>
  );
}

