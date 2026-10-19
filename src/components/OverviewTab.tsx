import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
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
  const [consent, setConsent] = useState(p.publicConsent);
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
        body.publicConsent = consent;
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

  let status = "Not public. Only your team and the organizers can see this project.";
  if (p.publicConsent && !p.submitted) status = "Consent given. The project can be reviewed once you submit it.";
  if (p.publicConsent && p.submitted && p.approvalStatus === "PENDING") status = "Awaiting review by an administrator.";
  if (p.publicConsent && p.approvalStatus === "APPROVED") status = "Approved. Your project is in the public showcase.";
  if (p.publicConsent && p.approvalStatus === "REJECTED") status = `Changes requested: ${p.approvalNote || "see the administrator's note"}`;

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

      <div className="rounded-lg border border-slate-200 p-4">
        <p className="text-sm font-semibold">Public showcase</p>
        {isLead ? (
          <label className="mt-2 flex items-start gap-3 text-sm text-slate-700">
            <input type="checkbox" checked={consent} disabled={readOnly}
              onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand" />
            <span>
              On behalf of our team, I agree that this project may be shown publicly if an administrator approves it. See the{" "}
              <Link to="/privacy" target="_blank" className="font-semibold text-brand">privacy and ownership terms</Link>.
            </span>
          </label>
        ) : (
          <p className="mt-2 text-sm text-slate-600">Only the team lead can give or withdraw public consent.</p>
        )}
        <p className="mt-3 text-sm text-slate-600">{status}</p>
        {p.approvalStatus === "APPROVED" && p.publicConsent && (
          <Link to={`/showcase/${p._id}`} className="mt-1 inline-block text-sm font-semibold text-brand hover:underline">View public page</Link>
        )}
        <p className="mt-2 text-xs text-slate-500">If you change public content after approval, the project goes back to review.</p>
      </div>

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