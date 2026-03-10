"use client";

const FONT_OPTIONS = [
  { id: "Amiri", label: "Amiri" },
  { id: "Cairo", label: "Cairo" },
  { id: "Noto Naskh Arabic", label: "Noto Naskh Arabic" },
  { id: "Aref Ruqaa", label: "Aref Ruqaa" },
  { id: "Tajawal", label: "Tajawal" }
] as const;

type Props = {
  value: string;
  onChange: (fontFamily: string) => void;
};

export function FontSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">الخط</div>
      <div className="grid grid-cols-1 gap-1.5">
        {FONT_OPTIONS.map((font) => {
          const isActive = font.id === value;
          return (
            <button
              key={font.id}
              type="button"
              onClick={() => onChange(font.id)}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-right transition ${
                isActive
                  ? "border-primary bg-primary/10"
                  : "border-slate-800 hover:border-slate-600"
              }`}
            >
              <span
                className="text-sm"
                style={{ fontFamily: `"${font.id}", system-ui, sans-serif` }}
              >
                محمد &amp; فاطمة
              </span>
              <span className="text-[10px] text-slate-400">{font.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

