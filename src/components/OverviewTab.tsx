import { useState } from "react";
import type { FormEvent } from "react";
import { api, errorMessage } from "../api/client";
import type { TabProps } from "../type";

const box =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-slate-50";

export default function OverviewTab({ data, isLead, reload }: TabProps) {
  const p = data.project;
  const [problem, setProblem] = useState(p.problemStatement ?? "");
  const [solution, setSolution] = useState(p.proposedSolution ?? "");
  const [recruiting, setRecruiting] = useState(p.lookingForMembers);
  const [lookingFor, setLookingFor] = useState(p.lookingFor ?? "");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const readOnly = data.locked;

  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const body: Record<string, unknown> = { problemStatement: problem, proposedSolution: solution };
      if (isLead) {
        body.lookingForMembers = recruiting;
        body.lookingFor = lookingFor;
      }
      await api.patch(`/projects/${p._id}/workspace`, body);
      setNotice("Saved");
      reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-semibold">Problem statement</label>
        <textarea rows={4} maxLength={1000} value={problem} disabled={readOnly}
          onChange={(e) => setProblem(e.target.value)} placeholder="What problem are you solving, and for whom?" className={box} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold">Proposed solution</label>
        <textarea rows={4} maxLength={1000} value={solution} disabled={readOnly}
          onChange={(e) => setSolution(e.target.value)} placeholder="How will your team solve it?" className={box} />
      </div>

      {isLead && (
        <div className="rounded-lg border border-slate-200 p-4">
          <label className="flex items-center gap-3 text-sm font-semibold">
            <input type="checkbox" checked={recruiting} disabled={readOnly}
              onChange={(e) => setRecruiting(e.target.checked)} className="h-4 w-4 accent-brand" />
            Our team is looking for members
          </label>
          {recruiting && (
            <input value={lookingFor} maxLength={200} disabled={readOnly}
              onChange={(e) => setLookingFor(e.target.value)} placeholder="Who are you looking for?" className={`${box} mt-3`} />
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-emerald-700">{notice}</p>}
      {!readOnly && (
        <button type="submit" disabled={busy}
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
          {busy ? "Saving…" : "Save changes"}
        </button>
      )}
    </form>
  );
}