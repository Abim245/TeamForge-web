import { Clock, Lock } from "lucide-react";

export default function DeadlineBanner({ deadline, locked }: { deadline: string | null; locked: boolean }) {
  if (locked) {
    return (
      <p className="mt-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <Lock size={16} /> The submission deadline has passed. This workspace is now read-only.
      </p>
    );
  }
  if (!deadline) return null;

  const d = new Date(deadline);
  const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
  return (
    <p className="mt-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <Clock size={16} />
      Submissions close {d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
      {days >= 0 && ` (${days} ${days === 1 ? "day" : "days"} left)`}.
    </p>
  );
}