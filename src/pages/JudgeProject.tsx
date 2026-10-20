import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { api, errorMessage } from "../api/client";
import TrackBadge from "../components/TrackBadge";
import Badge from "../components/Badge";
import { card, smallInput } from "../style";
import type { Criterion, JudgeProjectDetail } from "../type";

const isWebLink = (u: string) => /^https?:\/\//i.test(u);

// Same formula the server uses: each criterion counts in proportion to its weight
function previewTotal(criteria: Criterion[], values: Record<string, string>) {
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  if (!totalWeight) return 0;
  let points = 0;
  for (const c of criteria) {
    const raw = (values[c._id] ?? "").trim();
    const v = Number(raw);
    if (raw !== "" && !Number.isNaN(v)) points += (Math.min(v, c.maxScore) / c.maxScore) * c.weight;
  }
  return Math.round((points / totalWeight) * 1000) / 10;
}

function ScoreForm({ detail, reload }: { detail: JudgeProjectDetail; reload: () => void }) {
  const { criteria, score, status, project } = detail;
  const locked = status !== "OPEN" || score?.status === "SUBMITTED" || score?.status === "CONFLICT";

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries((score?.scores ?? []).map((s) => [s.criterion, String(s.value)]))
  );
  const [feedback, setFeedback] = useState(score?.feedback ?? "");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictNote, setConflictNote] = useState("");

  const base = `/judging/projects/${project._id}`;

  function collect() {
    const scores: { criterion: string; value: number }[] = [];
    for (const c of criteria) {
      const raw = (values[c._id] ?? "").trim();
      if (raw === "") continue;
      const v = Number(raw);
      if (Number.isNaN(v) || v < 0 || v > c.maxScore) {
        setError(`${c.name} must be a number between 0 and ${c.maxScore}`);
        return null;
      }
      scores.push({ criterion: c._id, value: v });
    }
    return { scores, feedback: feedback.trim() };
  }

  async function run(action: () => Promise<string | void>) {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const message = await action();
      if (message) setNotice(message);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function saveDraft() {
    const payload = collect();
    if (!payload) return;
    run(async () => {
      await api.put(`${base}/score`, payload);
      return "Draft saved";
    });
  }

  function submit() {
    const payload = collect();
    if (!payload) return;
    if (payload.scores.length < criteria.length) return setError("Score every criterion before submitting");
    if (payload.feedback.length < 10) return setError("Write a few sentences of feedback for the team");
    if (!window.confirm("Submit your scores? You will not be able to change them afterwards.")) return;
    run(async () => {
      await api.post(`${base}/score/submit`, payload);
      reload();
    });
  }

  function declareConflict() {
    if (!window.confirm("Declare a conflict of interest? You will not score this project.")) return;
    run(async () => {
      await api.post(`${base}/conflict`, { note: conflictNote.trim() });
      reload();
    });
  }

  function withdrawConflict() {
    run(async () => {
      await api.delete(`${base}/conflict`);
      reload();
    });
  }

  if (score?.status === "CONFLICT") {
    return (
      <div className={`${card} space-y-3`}>
        <h2 className="text-lg font-semibold">Conflict of interest</h2>
        <p className="text-sm text-slate-600">
          {score.conflictBy === "ADMIN"
            ? "An administrator recorded a conflict of interest, so you cannot score this project."
            : "You declared a conflict of interest, so you will not score this project."}
        </p>
        {score.conflictNote && <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{score.conflictNote}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {score.conflictBy === "JUDGE" && status === "OPEN" && (
          <button onClick={withdrawConflict} disabled={busy}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60">
            Withdraw my conflict
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`${card} space-y-5`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Your scores</h2>
        {score?.status === "SUBMITTED" && <Badge tone="green">Submitted</Badge>}
        {score?.status === "DRAFT" && <Badge tone="amber">Draft</Badge>}
      </div>

      {status === "FINALIZED" && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">Results are finalized. Scoring is locked.</p>
      )}
      {score?.status === "SUBMITTED" && status === "OPEN" && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Submitted and locked. If you need to change something, ask an administrator to reopen your scores.
        </p>
      )}

      {criteria.map((c) => (
        <div key={c._id}>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor={`c-${c._id}`} className="text-sm font-semibold">{c.name}</label>
            <span className="text-xs text-slate-500">weight {c.weight}</span>
          </div>
          {c.description && <p className="text-xs text-slate-500">{c.description}</p>}
          <div className="mt-2 flex items-center gap-2">
            <input id={`c-${c._id}`} type="number" min={0} max={c.maxScore} step={0.5} disabled={locked}
              value={values[c._id] ?? ""} onChange={(e) => setValues({ ...values, [c._id]: e.target.value })}
              className={`${smallInput} w-28`} />
            <span className="text-sm text-slate-500">/ {c.maxScore}</span>
          </div>
        </div>
      ))}

      <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
        Your total: <strong>{previewTotal(criteria, values)}</strong> / 100
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold">Feedback for the team</label>
        <textarea rows={5} maxLength={2000} disabled={locked} value={feedback} onChange={(e) => setFeedback(e.target.value)}
          placeholder="What worked well and what could be better? Teams see this anonymously after the results are announced."
          className={`${smallInput} w-full`} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-emerald-700">{notice}</p>}

      {!locked && (
        <>
          <div className="flex flex-wrap gap-3">
            <button onClick={saveDraft} disabled={busy}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60">
              Save draft
            </button>
            <button onClick={submit} disabled={busy}
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
              Submit scores
            </button>
          </div>

          <div className="border-t border-slate-200 pt-4">
            {conflictOpen ? (
              <div className="space-y-2">
                <textarea rows={2} maxLength={300} value={conflictNote} onChange={(e) => setConflictNote(e.target.value)}
                  placeholder="Briefly explain the conflict (optional)" className={`${smallInput} w-full`} />
                <div className="flex gap-3">
                  <button onClick={declareConflict} disabled={busy}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">
                    Declare conflict
                  </button>
                  <button onClick={() => setConflictOpen(false)} className="text-sm font-semibold text-slate-600">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConflictOpen(true)} className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                I have a conflict of interest with this project
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function JudgeProject() {
  const { id } = useParams();
  const [detail, setDetail] = useState<JudgeProjectDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await api.get(`/judging/projects/${id}`);
      setDetail(r.data);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const back = (
    <Link to="/judging" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
      <ArrowLeft size={16} /> All projects
    </Link>
  );

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (error || !detail) {
    return (
      <div className="mx-auto max-w-3xl">
        {back}
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error || "Project not found"}</p>
      </div>
    );
  }

  const { project } = detail;
  const s = project.submission;
  const links = [
    { label: "Repository", url: s.repoUrl },
    { label: "Demo", url: s.demoUrl },
    { label: "Presentation", url: s.presentationUrl },
    { label: "Documentation", url: s.docsUrl },
    ...s.screenshots.map((u, i) => ({ label: `Screenshot ${i + 1}`, url: u })),
  ].filter((l) => l.url && isWebLink(l.url));

  return (
    <div className="mx-auto max-w-6xl">
      {back}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div>
            <TrackBadge track={project.track} />
            <h1 className="mt-3 text-3xl font-normal tracking-tight">{project.name}</h1>
            <p className="mt-1 text-slate-500">{project.description}</p>
          </div>

          {s.summary && (
            <section className={card}>
              <h2 className="text-lg font-semibold">Project description</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{s.summary}</p>
            </section>
          )}
          {(project.problemStatement || project.proposedSolution) && (
            <section className={`${card} grid gap-6 md:grid-cols-2`}>
              <div>
                <h2 className="font-semibold">Problem</h2>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{project.problemStatement || "—"}</p>
              </div>
              <div>
                <h2 className="font-semibold">Solution</h2>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{project.proposedSolution || "—"}</p>
              </div>
            </section>
          )}
          {links.length > 0 && (
            <section className={card}>
              <h2 className="text-lg font-semibold">Links</h2>
              <ul className="mt-3 space-y-2">
                {links.map((l) => (
                  <li key={l.label + l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 break-all text-sm font-semibold text-brand hover:underline">
                      <ExternalLink size={14} className="shrink-0" /> {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className={card}>
            <h2 className="text-lg font-semibold">Team</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {project.members.map((m) => (
                <li key={m._id} className="text-sm">
                  <span className="font-medium">{m.name}</span>
                  {m.title && <span className="text-slate-500"> · {m.title}</span>}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <ScoreForm key={detail.score?.status ?? "none"} detail={detail} reload={load} />
        </div>
      </div>
    </div>
  );
}