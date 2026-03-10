"use client";

type Align = "left" | "center" | "right";

type Props = {
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  onFontSizeChange: (size: number) => void;
  onColorChange: (color: string) => void;
  onAlignChange: (align: Align) => void;
  onLineSpacingChange: (value: number) => void;
};

const FONT_OPTIONS = [
  "Amiri",
  "Cairo",
  "Noto Naskh Arabic",
  "Aref Ruqaa",
  "Tajawal"
] as const;

export function TextStylePanel({
  fontFamily,
  onFontFamilyChange,
  onFontSizeChange,
  onColorChange,
  onAlignChange,
  onLineSpacingChange
}: Props) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-3">
      <div className="text-sm font-semibold">تنسيق النص</div>

      <div className="space-y-1">
        <div className="text-[11px] text-slate-300">نوع الخط</div>
        <div className="grid grid-cols-1 gap-1.5">
          {FONT_OPTIONS.map((font) => {
            const active = font === fontFamily;
            return (
              <button
                key={font}
                type="button"
                onClick={() => onFontFamilyChange(font)}
                className={`flex items-center justify-between rounded-lg border px-3 py-1.5 text-right text-xs transition ${
                  active
                    ? "border-primary bg-primary/10"
                    : "border-slate-800 hover:border-slate-600"
                }`}
              >
                <span
                  className="text-sm"
                  style={{ fontFamily: `"${font}", system-ui, sans-serif` }}
                >
                  محمد &amp; فاطمة
                </span>
                <span className="text-[10px] text-slate-400">{font}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-[11px] text-slate-300">حجم الخط</div>
        <input
          type="range"
          min={20}
          max={80}
          defaultValue={40}
          onChange={(e) => onFontSizeChange(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="space-y-1">
        <div className="text-[11px] text-slate-300">لون النص</div>
        <input
          type="color"
          defaultValue="#ffffff"
          onChange={(e) => onColorChange(e.target.value)}
          className="h-8 w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-900"
        />
      </div>

      <div className="space-y-1">
        <div className="text-[11px] text-slate-300">محاذاة النص</div>
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: "right", label: "يمين" },
            { id: "center", label: "وسط" },
            { id: "left", label: "يسار" }
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onAlignChange(opt.id as Align)}
              className="rounded-lg border border-slate-800 bg-slate-900/70 px-2 py-1 text-[11px] hover:border-primary"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-[11px] text-slate-300">تباعد الأسطر</div>
        <input
          type="range"
          min={0.8}
          max={2}
          step={0.05}
          defaultValue={1.2}
          onChange={(e) => onLineSpacingChange(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}

