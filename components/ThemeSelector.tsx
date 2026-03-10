"use client";

export type ThemeId =
  | "gold"
  | "beige"
  | "pink"
  | "royal_blue"
  | "black_white";

export type ThemeConfig = {
  id: ThemeId;
  name: string;
  textColor: string;
  promptSuffix: string;
};

const THEMES: ThemeConfig[] = [
  {
    id: "gold",
    name: "ذهبي فاخر",
    textColor: "#f5e7c0",
    promptSuffix: "luxury gold Arabic invitation"
  },
  {
    id: "beige",
    name: "بيج هادئ",
    textColor: "#f5e9dc",
    promptSuffix: "soft beige elegant background"
  },
  {
    id: "pink",
    name: "وردي ناعم",
    textColor: "#ffd6e7",
    promptSuffix: "soft pink floral Arabic invitation"
  },
  {
    id: "royal_blue",
    name: "أزرق ملكي",
    textColor: "#c7e0ff",
    promptSuffix: "royal blue luxury invitation"
  },
  {
    id: "black_white",
    name: "أبيض وأسود",
    textColor: "#ffffff",
    promptSuffix: "minimal black and white Arabic invitation"
  }
];

type Props = {
  value: ThemeId | null;
  onChange: (theme: ThemeConfig) => void;
};

export function ThemeSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-3">
      <div className="text-sm font-semibold">ألوان جاهزة</div>
      <div className="flex flex-wrap gap-2">
        {THEMES.map((theme) => {
          const active = theme.id === value;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onChange(theme)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] transition ${
                active
                  ? "border-primary bg-primary/10"
                  : "border-slate-800 bg-slate-900/60 hover:border-primary"
              }`}
            >
              <span
                className="h-3 w-3 rounded-full border border-slate-900"
                style={{ backgroundColor: theme.textColor }}
              />
              <span>{theme.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

