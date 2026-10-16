import { useState } from "react";
import type { FormEvent } from "react";
import { api, errorMessage } from "../api/client";
import SubmissionReceipt from "./SubmissionReciept";
import type { TabProps } from "../type";

const box =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-slate-50";

export default function SubmissionTab({ data, isLead, reload }: TabProps) {
  const p = data.project;
  const s = p.submission;
  const [summary, setSummary] = useState(s?.summary ?? "");
  const [repoUrl, setRepoUrl] = useState(s?.repoUrl ?? "");
  const [demoUrl, setDemoUrl] = useState(s?.demoUrl ?? "");
  const [presentationUrl, setPresentationUrl] = useState(s?.presentationUrl ?? "");
  const [docsUrl, setDocsUrl] = useState(s?.docsUrl ?? "");
  const [shots, setShots] = useState((s?.screenshots ?? []).join("\n"));
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const readOnly = data.locked;

  function payload() {
    return {
      summary: summary.trim(),
      repoUrl: repoUrl.trim(),
      demoUrl: demoUrl.trim(),
      presentationUrl: presentationUrl.trim(),
      docsUrl: docsUrl.trim(),
      screenshots: shots.split("\n").map((l) => l.trim()).filter(Boolean),
    };
  }

  async function saveDraft(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await api.put(`/projects/${p._id}/submission`, payload());
      setNotice("Draft saved");
      reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await api.put(`/projects/${p._id}/submission`, payload());
      await api.post(`/projects/${p._id}/submit`);
      reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const field = (label: string, value: string, set: (v: string) => void, placeholder: string) => (
    <div>
      <label className="mb-1.5 block text-sm font-semibold">{label}</label>
      <input type="url" value={value} disabled={readOnly} onChange={(e) => set(e.target.value)} placeholder={placeholder} className={box} />
    </div>
  );

  return (
    <div>
      {p.submitted && s?.submittedAt && (
        <SubmissionReceipt projectName={p.name} submittedAt={s.submittedAt}
          deadline={data.settings.submissionDeadline} locked={data.locked} />
      )}

      <form onSubmit={saveDraft} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-semibold">Project description</label>
          <textarea rows={5} maxLength={2000} value={summary} disabled={readOnly}
            onChange={(e) => setSummary(e.target.value)} placeholder="Describe what you built and how it works" className={box} />
        </div>
        {field("Repository link", repoUrl, setRepoUrl, "https://github.com/your-team/project")}
        {field("Demo link", demoUrl, setDemoUrl, "https://…")}
        {field("Presentation link", presentationUrl, setPresentationUrl, "https://…")}
        {field("Supporting documentation", docsUrl, setDocsUrl, "https://…")}
        <div>
          <label className="mb-1.5 block text-sm font-semibold">Screenshot links</label>
          <textarea rows={3} value={shots} disabled={readOnly} onChange={(e) => setShots(e.target.value)}
            placeholder={"One link per line (up to 6)\nhttps://…"} className={box} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {notice && <p className="text-sm text-emerald-700">{notice}</p>}

        {!readOnly && (
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={busy}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60">
              Save draft
            </button>
            {isLead ? (
              <button type="button" onClick={submit} disabled={busy}
                className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
                {busy ? "Working…" : p.submitted ? "Submit again" : "Submit project"}
              </button>
            ) : (
              <p className="text-sm text-slate-500">Only the team lead can send the final submission.</p>
            )}
          </div>
        )}
        <p className="text-xs text-slate-500">
          Any team member can edit the submission. You can change it and submit again until the deadline.
        </p>
      </form>
    </div>
  );
}