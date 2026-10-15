import { ChevronDown } from "lucide-react";
import { inputClass } from "../style";
import { TRACK_LABELS } from "../type";
import type { Track } from "../type";

interface Props {
  id: string;
  value: Track | "";
  onChange: (v: Track | "") => void;
  placeholder: string;
}

export default function TrackSelect({ id, value, onChange, placeholder }: Props) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as Track | "")}
        className={`${inputClass} appearance-none pr-10 ${value ? "" : "text-slate-500"}`}
      >
        <option value="">{placeholder}</option>
        {(Object.keys(TRACK_LABELS) as Track[]).map((t) => (
          <option key={t} value={t}>
            {TRACK_LABELS[t]}
          </option>
        ))}
      </select>
      <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
    </div>
  );
}