"use client";

import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { BranchControls } from "./BranchControls";
import type { SizePreset } from "@/lib/supabase";

export type CanvasEditorHandle = {
  setBackground: (url: string) => Promise<void>;
  setBackgroundOnly: (url: string) => Promise<void>;
  clearCanvas: () => void;
  exportWithWatermark: () => Promise<Blob | null>;
  exportClean: () => Promise<Blob | null>;
  setFontForText: (fontFamily: string) => void;
  setFontSizeForText: (size: number) => void;
  setFillColorForText: (color: string) => void;
  setTextAlignForText: (align: "left" | "center" | "right") => void;
  setLineSpacingForText: (value: number) => void;
  applyInvitationText: (details: {
    eventType: string;
    mainTitle: string;
    names: string;
    date: string;
    day: string;
    time: string;
    location: string;
    extraPhrase: string;
  }) => void;
};

type Props = {
  sizePreset: SizePreset;
  onBranchRequest: (direction: "top" | "bottom" | "left" | "right") => void;
  loading: boolean;
};

const SAMPLE_LINES = [
  "محمد & فاطمة",
  "يسرّهم دعوتكم",
  "لحضور حفل الزواج",
  "مساء الجمعة"
];

export function CanvasEditor({ sizePreset, onBranchRequest, loading }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const el = document.createElement("canvas");
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(el);

    const canvas = new fabric.Canvas(el, {
      preserveObjectStacking: true
    });
    canvasRef.current = canvas;

    fabric.Object.prototype.set({
      cornerColor: "#0f766e",
      borderColor: "#0f766e",
      cornerStyle: "circle",
      transparentCorners: false
    });

    const { width, height } = sizePreset;
    canvas.setWidth(width);
    canvas.setHeight(height);

    const scaleToFit = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const scale = Math.min(
        containerWidth / width,
        containerHeight / height,
        1
      );
      canvas.setZoom(scale);
      canvas.setViewportTransform([scale, 0, 0, scale, 0, 0]);
      canvas.renderAll();
    };

    scaleToFit();
    window.addEventListener("resize", scaleToFit);

    return () => {
      window.removeEventListener("resize", scaleToFit);
      canvas.dispose();
    };
  }, [sizePreset]);

  const applyDefaultTextLayout = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = sizePreset;

    // Remove previous text objects to avoid clutter
    const objects = canvas.getObjects();
    objects.forEach((obj) => {
      if (obj instanceof fabric.IText) {
        canvas.remove(obj);
      }
    });

    const lineHeight = 44;
    const totalHeight = SAMPLE_LINES.length * lineHeight;
    const startTop = height / 2 - totalHeight / 2;

    SAMPLE_LINES.forEach((textValue, index) => {
      const text = new fabric.IText(textValue, {
        left: width / 2,
        top: startTop + index * lineHeight,
        fill: "#ffffff",
        fontSize: 40,
        fontFamily: "Amiri",
        originX: "center",
        textAlign: "center",
        direction: "rtl"
      });
      canvas.add(text);
    });

    canvas.renderAll();
  };

  const setBackground = async (url: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setBackgroundUrl(url);

    return new Promise<void>((resolve, reject) => {
      fabric.Image.fromURL(url, { crossOrigin: "anonymous" })
        .then((img) => {
          if (!img) {
            reject(new Error("Failed to load image"));
            return;
          }
          const { width, height } = sizePreset;
          img.set({
            selectable: false,
            evented: false,
            opacity: 0
          });
          img.scaleToWidth(width);
          img.scaleToHeight(height);
          canvas.backgroundImage = img;
          img.set("opacity", 0);
          canvas.requestRenderAll();
          img.animate(
            { opacity: 1 },
            {
              duration: 600,
              onChange: () => canvas.requestRenderAll(),
              onComplete: () => {
                applyDefaultTextLayout();
                resolve();
              }
            }
          );
        })
        .catch(reject);
    });
  };

  const setBackgroundOnly = async (url: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setBackgroundUrl(url);

    return new Promise<void>((resolve, reject) => {
      fabric.Image.fromURL(url, { crossOrigin: "anonymous" })
        .then((img) => {
          if (!img) {
            reject(new Error("Failed to load image"));
            return;
          }
          const { width, height } = sizePreset;
          img.set({
            selectable: false,
            evented: false,
            opacity: 0
          });
          img.scaleToWidth(width);
          img.scaleToHeight(height);
          canvas.backgroundImage = img;
          img.set("opacity", 0);
          canvas.requestRenderAll();
          img.animate(
            { opacity: 1 },
            {
              duration: 600,
              onChange: () => canvas.requestRenderAll(),
              onComplete: () => resolve()
            }
          );
        })
        .catch(reject);
    });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setBackgroundUrl(null);
    canvas.backgroundImage = undefined;
    canvas.requestRenderAll();
    const objects = canvas.getObjects();
    objects.forEach((obj) => canvas.remove(obj));
    canvas.renderAll();
  };

  const setFontForText = (font: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (active && active instanceof fabric.IText) {
      active.set("fontFamily", font);
    } else {
      // If nothing is selected, update all text layers to keep UX simple
      canvas.getObjects().forEach((obj) => {
        if (obj instanceof fabric.IText) {
          obj.set("fontFamily", font);
        }
      });
    }

    canvas.requestRenderAll();
  };

  const setFontSizeForText = (size: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (active && active instanceof fabric.IText) {
      active.set("fontSize", size);
    } else {
      canvas.getObjects().forEach((obj) => {
        if (obj instanceof fabric.IText) {
          obj.set("fontSize", size);
        }
      });
    }
    canvas.requestRenderAll();
  };

  const setFillColorForText = (color: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (active && active instanceof fabric.IText) {
      active.set("fill", color);
    } else {
      canvas.getObjects().forEach((obj) => {
        if (obj instanceof fabric.IText) {
          obj.set("fill", color);
        }
      });
    }
    canvas.requestRenderAll();
  };

  const setTextAlignForText = (align: "left" | "center" | "right") => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObject();
    const applyAlign = (obj: fabric.IText) => {
      obj.set("textAlign", align);
      if (align === "left") obj.set("originX", "left");
      if (align === "center") obj.set("originX", "center");
      if (align === "right") obj.set("originX", "right");
    };

    if (active && active instanceof fabric.IText) {
      applyAlign(active);
    } else {
      canvas.getObjects().forEach((obj) => {
        if (obj instanceof fabric.IText) {
          applyAlign(obj);
        }
      });
    }
    canvas.requestRenderAll();
  };

  const setLineSpacingForText = (value: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (active && active instanceof fabric.IText) {
      active.set("lineHeight", value);
    } else {
      canvas.getObjects().forEach((obj) => {
        if (obj instanceof fabric.IText) {
          obj.set("lineHeight", value);
        }
      });
    }
    canvas.requestRenderAll();
  };

  const applyInvitationText: CanvasEditorHandle["applyInvitationText"] = (
    details
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const GAP = 12;
    const lineSpecs: { text: string; fontSize: number }[] = [];
    if (details.mainTitle)
      lineSpecs.push({ text: details.mainTitle, fontSize: 54 });
    if (details.names) lineSpecs.push({ text: details.names, fontSize: 64 });
    if (details.eventType)
      lineSpecs.push({ text: details.eventType, fontSize: 36 });
    const dateDay = [details.date, details.day].filter(Boolean).join(" - ");
    if (dateDay) lineSpecs.push({ text: dateDay, fontSize: 28 });
    if (details.time) lineSpecs.push({ text: details.time, fontSize: 26 });
    if (details.location)
      lineSpecs.push({ text: details.location, fontSize: 30 });
    if (details.extraPhrase)
      lineSpecs.push({ text: details.extraPhrase, fontSize: 24 });

    const { width, height } = sizePreset;
    const objects = canvas.getObjects();
    objects.forEach((obj) => {
      if (obj instanceof fabric.IText) {
        canvas.remove(obj);
      }
    });

    if (lineSpecs.length === 0) {
      canvas.renderAll();
      return;
    }

    const totalHeight =
      lineSpecs.reduce((sum, { fontSize }) => sum + fontSize + GAP, 0) - GAP;
    let top = height / 2 - totalHeight / 2;

    lineSpecs.forEach(({ text: value, fontSize }) => {
      const text = new fabric.IText(value, {
        left: width / 2,
        top,
        fill: "#ffffff",
        fontSize,
        fontFamily: "Amiri",
        originX: "center",
        textAlign: "center",
        direction: "rtl"
      });
      canvas.add(text);
      top += fontSize + GAP;
    });

    canvas.renderAll();
  };

  const exportBase = async (withWatermark: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    let watermark: fabric.IText | undefined;
    if (withWatermark) {
      watermark = new fabric.IText("Preview – Generated with Dawati", {
        fontSize: 48,
        fill: "rgba(255,255,255,0.12)",
        angle: -25,
        originX: "center",
        originY: "center",
        left: sizePreset.width / 2,
        top: sizePreset.height / 2,
        fontFamily: "Cairo"
      });
      canvas.add(watermark);
      watermark.bringToFront();
      canvas.renderAll();
    }

    const dataUrl = canvas.toDataURL({
      format: "png",
      multiplier: 1
    });

    if (withWatermark && watermark) {
      canvas.remove(watermark);
      canvas.renderAll();
    }

    const res = await fetch(dataUrl);
    return await res.blob();
  };

  const exportWithWatermark = () => exportBase(true);
  const exportClean = () => exportBase(false);

  (globalThis as any).__canvasEditorHandle = {
    setBackground,
    setBackgroundOnly,
    clearCanvas,
    exportWithWatermark,
    exportClean,
    setFontForText,
    setFontSizeForText,
    setFillColorForText,
    setTextAlignForText,
    setLineSpacingForText,
    applyInvitationText
  } as CanvasEditorHandle;

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="flex h-full w-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-colors duration-300"
      />
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm text-center text-sm">
          <div className="mb-3 text-base">✨ جاري تصميم الدعوة...</div>
          <div className="relative h-16 w-40 overflow-hidden rounded-xl bg-slate-900/60">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 animate-pulse" />
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.2s_infinite]" />
          </div>
        </div>
      )}
      <BranchControls onBranch={onBranchRequest} />
    </div>
  );
}

