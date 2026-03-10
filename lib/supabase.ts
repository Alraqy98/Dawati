import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // eslint-disable-next-line no-console
  console.warn("Supabase env vars are not set");
}

export const supabase = createClient(supabaseUrl || "", supabaseKey || "");

export type SizePresetId =
  | "instagram"
  | "whatsapp"
  | "classic"
  | "print"
  | "story"
  | "square_print";

export type SizePreset = {
  id: SizePresetId;
  name: string;
  width: number;
  height: number;
  label: string;
  shape: "square" | "vertical" | "horizontal" | "tall";
};

export const SIZE_PRESETS: SizePreset[] = [
  {
    id: "whatsapp",
    name: "WhatsApp Invitation",
    width: 1080,
    height: 1920,
    label: "Best for sharing on WhatsApp",
    shape: "vertical"
  },
  {
    id: "instagram",
    name: "Instagram Post",
    width: 1080,
    height: 1080,
    label: "Perfect for Instagram",
    shape: "square"
  },
  {
    id: "classic",
    name: "Classic Invitation Card",
    width: 1200,
    height: 1800,
    label: "Traditional invitation layout",
    shape: "vertical"
  },
  {
    id: "print",
    name: "Print Card",
    width: 1800,
    height: 1200,
    label: "Printable horizontal card",
    shape: "horizontal"
  },
  {
    id: "story",
    name: "Story Format",
    width: 1080,
    height: 1920,
    label: "قصص إنستغرام وسنابشات",
    shape: "tall"
  },
  {
    id: "square_print",
    name: "Square Print",
    width: 2048,
    height: 2048,
    label: "طباعة عالية الدقة",
    shape: "square"
  }
];

