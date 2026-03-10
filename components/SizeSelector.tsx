import { SIZE_PRESETS, SizePreset, SizePresetId } from "@/lib/supabase";

type Props = {
  value: SizePresetId;
  onChange: (preset: SizePreset) => void;
};

export function SizeSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">2. اختر مقاس الدعوة</div>
      <div className="grid grid-cols-2 gap-2">
        {SIZE_PRESETS.map((preset) => {
          const isActive = preset.id === value;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset)}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-right transition cursor-pointer ${
                isActive
                  ? "border-primary bg-primary/10"
                  : "border-slate-800 hover:border-slate-600"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center">
                <div
                  className={`rounded-md border border-slate-500/60 bg-slate-900/60 ${
                    preset.shape === "square"
                      ? "h-6 w-6"
                      : preset.shape === "vertical" || preset.shape === "tall"
                      ? "h-7 w-5"
                      : "h-5 w-7"
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold">{preset.name}</div>
                <div className="text-[10px] text-slate-400">
                  {preset.width} × {preset.height}px
                </div>
                <div className="mt-0.5 text-[10px] text-slate-400 line-clamp-1">
                  {preset.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

