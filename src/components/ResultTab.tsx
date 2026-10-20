import { useEffect, useState } from "react";
import { api, errorMessage } from "../api/client";
import Badge from "./Badge";
import type { JudgingFeedback, TabProps } from "../type";

export default function ResultsTab({ data }: TabProps) {
  const [fb, setFb] = useState<JudgingFeedback | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/projects/${data.project._id}/judging-feedback`)
      .then((r) => setFb(r.data))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [data.project._id]);

  if (loading) return <p className="text-slate-500">Loading results…</p>;
  if (error || !fb) return <p className="text-slate-600">{error || "No results available."}</p>;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          {fb.label === "WINNER" && <Badge tone="amber">Winner</Badge>}
          {fb.label === "FINALIST" && <Badge tone="blue">Finalist</Badge>}
          {fb.rank !== null && <Badge tone="gray">Ranked #{fb.rank}</Badge>}
        </div>
        {fb.average !== null && (
          <p className="mt-3 text-3xl font-normal">
            {fb.average} <span className="text-base text-slate-500">/ 100</span>
          </p>
        )}
        <p className="text-sm text-slate-500">
          Average from {fb.judgeCount} {fb.judgeCount === 1 ? "judge" : "judges"}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Score by criterion</h3>
        <ul className="mt-4 space-y-4">
          {fb.perCriterion.map((c) => (
            <li key={c.criterion}>
              <div className="flex justify-between text-sm">
                <span className="font-medium">{c.name}</span>
                <span className="text-slate-500">{c.average} / {c.maxScore}</span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-brand" style={{ width: `${Math.min(100, (c.average / c.maxScore) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Feedback from the judges</h3>
        <p className="mt-1 text-xs text-slate-500">Comments are anonymous.</p>
        {fb.comments.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No written feedback.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {fb.comments.map((c, i) => (
              <li key={i} className="whitespace-pre-wrap rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">{c}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}