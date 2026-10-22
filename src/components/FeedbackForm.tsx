import { useState } from "react";
import type { FormEvent } from "react";
import { api, errorMessage } from "../api/client";
import { formatDate } from "../format";
import { smallInput } from "../style";
import type { SessionItem } from "../type";

interface Props {
  projectId: string;
  sessions: SessionItem[];
  onSaved: () => void;
}

export default function FeedbackForm({ projectId, sessions, onSaved }: Props) {
  const [summary, setSummary] = useState("");
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const related = sessions.filter((s) => s.status === "CONFIRMED" || s.status === "COMPLETED");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const body: Record<string, unknown> = {
        summary: summary.trim(),
        strengths: strengths.trim(),
        improvements: improvements.trim(),
        nextSteps: nextSteps.trim(),
      };
      if (sessionId) body.sessionId = sessionId;
      await api.post(`/mentoring/teams/${projectId}/feedback`, body);
      setSummary("");
      setStrengths("");
      setImprovements("");
      setNextSteps("");
      setSessionId("");
      setNotice("Feedback sent. The team has been notified.");
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const area = `${smallInput} w-full`;
  const label = "mb-1 block text-sm font-semibold";

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-slate-200 p-4">
      <p className="font-semibold">Leave feedback for the team</p>
      {related.length > 0 && (
        <select value={sessionId} onChange={(e) => setSessionId(e.target.value)} className={area}>
          <option value="">Not tied to a session</option>
          {related.map((s) => <option key={s._id} value={s._id}>{s.topic} · {formatDate(s.startsAt)}</option>)}
        </select>
      )}
      <div>
        <label className={label}>Summary (optional)</label>
        <input maxLength={500} value={summary} onChange={(e) => setSummary(e.target.value)} className={area} />
      </div>
      <div>
        <label className={label}>What is working</label>
        <textarea required minLength={5} maxLength={1000} rows={3} value={strengths} onChange={(e) => setStrengths(e.target.value)} className={area} />
      </div>
      <div>
        <label className={label}>What to improve</label>
        <textarea required minLength={5} maxLength={1000} rows={3} value={improvements} onChange={(e) => setImprovements(e.target.value)} className={area} />
      </div>
      <div>
        <label className={label}>Next steps</label>
        <textarea required minLength={5} maxLength={1000} rows={3} value={nextSteps} onChange={(e) => setNextSteps(e.target.value)} className={area} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-emerald-700">{notice}</p>}
      <button type="submit" disabled={busy}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
        {busy ? "Sending…" : "Send feedback"}
      </button>
    </form>
  );
}