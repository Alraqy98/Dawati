type Props = {
  onBranch: (direction: "top" | "bottom" | "left" | "right") => void;
};

export function BranchControls({ onBranch }: Props) {
  return (
    <>
      <button
        type="button"
        onClick={() => onBranch("top")}
        className="absolute -top-4 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-slate-900 text-xs border border-slate-700 hover:border-primary hover:bg-primary/20"
      >
        +
      </button>
      <button
        type="button"
        onClick={() => onBranch("bottom")}
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-slate-900 text-xs border border-slate-700 hover:border-primary hover:bg-primary/20"
      >
        +
      </button>
      <button
        type="button"
        onClick={() => onBranch("left")}
        className="absolute top-1/2 -left-4 -translate-y-1/2 h-7 w-7 rounded-full bg-slate-900 text-xs border border-slate-700 hover:border-primary hover:bg-primary/20"
      >
        +
      </button>
      <button
        type="button"
        onClick={() => onBranch("right")}
        className="absolute top-1/2 -right-4 -translate-y-1/2 h-7 w-7 rounded-full bg-slate-900 text-xs border border-slate-700 hover:border-primary hover:bg-primary/20"
      >
        +
      </button>
    </>
  );
}

