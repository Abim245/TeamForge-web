import type { ReactNode } from "react";

const tones = {
  gray: "bg-slate-100 text-slate-600",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-800",
  red: "bg-red-50 text-red-700",
  blue: "bg-blue-50 text-brand",
};

export type Tone = keyof typeof tones;

export default function Badge({ tone = "gray", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}