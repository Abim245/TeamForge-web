import { TRACK_LABELS } from "../type";
import type { Track } from "../type";

const style: Record<Track, string> = {
  AI: "bg-indigo-50 text-indigo-700",
  DATA_SCIENCE: "bg-blue-50 text-blue-700",
  CYBERSECURITY: "bg-amber-50 text-amber-800",
};

export default function TrackBadge({ track }: { track: Track }) {
  return (
    <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${style[track]}`}>{TRACK_LABELS[track]}</span>
  );
}