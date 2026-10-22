import { formatDate } from "../format";
import type { MentorFeedbackItem } from "../type";

export default function FeedbackList({ items, showMentor }: { items: MentorFeedbackItem[]; showMentor: boolean }) {
  if (items.length === 0) return <p className="text-sm text-slate-500">No feedback yet.</p>;

  const section = (title: string, text: string) => (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{text}</p>
    </div>
  );

  return (
    <ul className="space-y-4">
      {items.map((f) => (
        <li key={f._id} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">
            {showMentor && f.mentor ? `${f.mentor.name} · ` : ""}{formatDate(f.createdAt)}
          </p>
          {f.summary && <p className="text-sm font-medium">{f.summary}</p>}
          {section("What is working", f.strengths)}
          {section("What to improve", f.improvements)}
          {section("Next steps", f.nextSteps)}
        </li>
      ))}
    </ul>
  );
}