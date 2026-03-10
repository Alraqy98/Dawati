"use client";

import { useEffect, useState } from "react";

export type EventDetails = {
  eventType: string;
  mainTitle: string;
  names: string;
  date: string;
  day: string;
  time: string;
  location: string;
  extraPhrase: string;
};

type Props = {
  value: EventDetails;
  onChange: (value: EventDetails) => void;
  onApplyToCanvas: () => void;
};

export function EventDetailsPanel({
  value,
  onChange,
  onApplyToCanvas
}: Props) {
  const [local, setLocal] = useState<EventDetails>(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const updateField = <K extends keyof EventDetails>(key: K, v: string) => {
    const next = { ...local, [key]: v };
    setLocal(next);
    onChange(next);
  };

  const Row = ({
    label,
    field
  }: {
    label: string;
    field: keyof EventDetails;
  }) => (
    <div className="space-y-1">
      <div className="text-[11px] text-slate-300">{label}</div>
      <input
        value={local[field]}
        onChange={(e) => updateField(field, e.target.value)}
        className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs focus:border-primary focus:outline-none"
        dir="rtl"
      />
    </div>
  );

  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-3">
      <div className="text-sm font-semibold mb-1">تفاصيل الدعوة</div>
      <Row label="نوع المناسبة" field="eventType" />
      <Row label="العنوان الرئيسي" field="mainTitle" />
      <Row label="الأسماء" field="names" />
      <Row label="التاريخ" field="date" />
      <Row label="اليوم" field="day" />
      <Row label="الوقت" field="time" />
      <Row label="الموقع" field="location" />
      <Row label="عبارة إضافية" field="extraPhrase" />
      <button
        type="button"
        onClick={onApplyToCanvas}
        className="mt-2 w-full rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700"
      >
        تطبيق النص على الدعوة
      </button>
    </div>
  );
}

