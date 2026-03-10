"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onConfirm: (description: string) => void;
  onClose: () => void;
};

export function VariationModal({ open, onConfirm, onClose }: Props) {
  const [text, setText] = useState("");

  if (!open) return null;

  const handleConfirm = () => {
    if (!text.trim()) return;
    onConfirm(text.trim());
    setText("");
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-950 px-4 py-4 text-right">
        <div className="mb-2 text-sm font-semibold">صف التعديل المطلوب</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          dir="rtl"
          className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          placeholder='مثال: "ألوان بيج هادئة مع إطار زهور"'
        />
        <div className="mt-3 flex justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 hover:border-slate-500"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-primary px-3 py-2 font-semibold text-white hover:bg-teal-700"
          >
            إنشاء نسخة جديدة
          </button>
        </div>
      </div>
    </div>
  );
}

