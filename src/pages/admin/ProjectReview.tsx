import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import Badge from "../../components/Badge";
import TrackBadge from "../../components/TrackBadge";
import { formatDate } from "../../format";
import { card, smallInput } from "../../style";
import type { ProjectDetailData, ProjectLabel } from "../../type";

function LinkRow({ label, url }: { label: string; url: string }) {
  if (!url) return null;
  const safe = /^https?:\/\//i.test(url);
  return (
    <p className="text-sm">
      <span className="font-semibold">{label}: </span>
      {safe ? <a href={url} target="_blank" rel="noopener noreferrer" className="break-all text-brand hover:underline">{url}</a>
            : <span className="break-all">{url}</span>}
    </p>
  );
}

export default function ProjectReview() {
  const { id } = useParams();
  const [p, setP] = useState<ProjectDetailData | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.get(`/admin/projects/${id}`).then((r) => setP(r.data.project)).catch((e) => setError(errorMessage(e)));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function review(status: "APPROVED" | "REJECTED") {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await api.patch(`/admin/projects/${id}/approval`, { status, note: status === "REJECTED" ? note.trim() : undefined });
      setNotice(status === "APPROVED" ? "Approved. The team has been notified." : "Sent back to the team with your note.");
      setNote("");
      load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function setLabel(label: ProjectLabel) {
    setError("");
    try {
      await api.patch(`/admin/projects/${id}/label`, { label });
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  if (!p) return <p className="text-slate-500">{error || "Loading…"}</p>;

  const s = p.submission;
  const canApprove = p.submitted && p.publicConsent;

  return (
    <div className="space-y-6">
      <Link to="/admin/projects" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> All projects
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <TrackBadge track={p.track} />
          <Badge tone={p.submitted ? "green" : "gray"}>{p.submitted ? "Submitted" : "Draft"}</Badge>
          <Badge tone={p.publicConsent ? "blue" : "gray"}>{p.publicConsent ? "Team consent given" : "No public consent"}</Badge>
          <Badge tone={p.approvalStatus === "APPROVED" ? "green" : p.approvalStatus === "REJECTED" ? "red" : "amber"}>
            {p.approvalStatus === "PENDING" ? "Pending review" : p.approvalStatus === "APPROVED" ? "Approved" : "Rejected"}
          </Badge>
        </div>
        <h2 className="mt-3 text-3xl font-normal">{p.name}</h2>
        <p className="mt-1 text-slate-500">{p.description}</p>
      </div>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}

      <section className={card}>
        <h3 className="text-lg font-semibold">Team</h3>
        <ul className="mt-3 space-y-1 text-sm">
          {p.members.map((m) => (
            <li key={m._id}>
              <span className="font-medium">{m.name}</span> · {m.email}
              {m._id === p.lead._id && <span className="ml-2 text-xs font-semibold text-brand">Lead</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className={`${card} space-y-3`}>
        <h3 className="text-lg font-semibold">Submission</h3>
        {s.summary ? <p className="whitespace-pre-wrap text-sm text-slate-700">{s.summary}</p> : <p className="text-sm text-slate-500">No summary yet.</p>}
        <LinkRow label="Repository" url={s.repoUrl} />
        <LinkRow label="Demo" url={s.demoUrl} />
        <LinkRow label="Presentation" url={s.presentationUrl} />
        <LinkRow label="Documentation" url={s.docsUrl} />
        {s.screenshots.map((u, i) => <LinkRow key={u} label={`Screenshot ${i + 1}`} url={u} />)}
        {s.submittedAt && (
          <p className="text-xs text-slate-500">
            Submitted {formatDate(s.submittedAt, true)}
            {s.termsAcceptedAt ? ` · terms accepted ${formatDate(s.termsAcceptedAt, true)} (version ${s.termsVersion ?? "unknown"})` : ""}
          </p>
        )}
      </section>

      {(p.problemStatement || p.proposedSolution) && (
        <section className={`${card} grid gap-6 md:grid-cols-2`}>
          <div><h3 className="font-semibold">Problem</h3><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{p.problemStatement || "—"}</p></div>
          <div><h3 className="font-semibold">Solution</h3><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{p.proposedSolution || "—"}</p></div>
        </section>
      )}

      <section className={card}>
        <h3 className="text-lg font-semibold">Decision</h3>
        {!canApprove && (
          <p className="mt-2 text-sm text-slate-600">
            {!p.submitted ? "This project has not been submitted yet." : "The team has not given consent to publish, so it cannot be approved."}
          </p>
        )}
        {p.approvalNote && p.approvalStatus === "REJECTED" && (
          <p className="mt-2 text-sm text-slate-600">Last note to the team: {p.approvalNote}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={() => review("APPROVED")} disabled={busy || !canApprove}
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
            Approve for showcase
          </button>
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={500}
          placeholder="To ask for changes, explain what the team should fix (required)" className={`${smallInput} mt-4 w-full`} />
        <button onClick={() => review("REJECTED")} disabled={busy || !p.submitted || note.trim().length === 0}
          className="mt-2 rounded-lg border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">
          Request changes
        </button>
      </section>

      {p.approvalStatus === "APPROVED" && (
        <section className={card}>
          <h3 className="text-lg font-semibold">Label</h3>
          <select value={p.label} onChange={(e) => setLabel(e.target.value as ProjectLabel)} className={`${smallInput} mt-3`}>
            <option value="NONE">No label</option>
            <option value="FINALIST">Finalist</option>
            <option value="WINNER">Winner</option>
          </select>
          <p className="mt-2 text-xs text-slate-500">Labels show on the public showcase. Teams are not notified when you set one.</p>
        </section>
      )}
    </div>
  );
}