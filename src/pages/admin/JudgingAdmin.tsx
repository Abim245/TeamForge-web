import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorData, errorMessage } from "../../api/client";
import Badge from "../../components/Badge";
import CriteriaEditor from "../../components/CriteriaEditor";
import ResultsPanel from "../../components/ResultPanel";
import ConflictForm from "../../components/ConflictForm";
import { card, smallInput } from "../../style";
import type { JudgingOverview, ResultRow } from "../../type";

interface Shortfall {
  name: string;
  submitted: number;
  drafts: number;
}

export default function JudgingAdmin() {
  const [overview, setOverview] = useState<JudgingOverview | null>(null);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [shortfalls, setShortfalls] = useState<Shortfall[] | null>(null);
  const [winners, setWinners] = useState(1);
  const [finalists, setFinalists] = useState(2);
  const [warning, setWarning] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const [o, r] = await Promise.all([api.get("/admin/judging"), api.get("/admin/judging/results")]);
      setOverview(o.data);
      setResults(r.data.results);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(action: () => Promise<string | void>) {
    setError("");
    setNotice("");
    setWarning([]);
    setBusy(true);
    try {
      const message = await action();
      if (message) setNotice(message);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const setStatus = (status: "OPEN" | "CLOSED") =>
    run(async () => {
      await api.patch("/admin/judging/status", { status });
      return status === "OPEN" ? "Judging is open. The judges were notified." : "Judging is closed.";
    });

  async function finalize(force: boolean) {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const r = await api.post("/admin/judging/finalize", { force });
      setShortfalls(null);
      setNotice(r.data.message);
      await load();
    } catch (err) {
      const data = errorData(err);
      if (data?.shortfalls) setShortfalls(data.shortfalls);
      else setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const reopen = () =>
    run(async () => {
      await api.post("/admin/judging/reopen");
      return "Scoring is open again.";
    });

  function announce() {
    if (!window.confirm("Announce the results? This labels the winners and finalists, notifies every team, and cannot be undone.")) return;
    run(async () => {
      const r = await api.post("/admin/judging/announce", { winners, finalists });
      setWarning(r.data.notPublic ?? []);
      return `Announced: ${r.data.winners.join(", ")} (winners)${r.data.finalists.length ? `; ${r.data.finalists.join(", ")} (finalists)` : ""}.`;
    });
  }

  if (!overview) return <p className="text-slate-500">{error || "Loading…"}</p>;

  const { status, counts } = overview;
  const canOpen = overview.criteria.length > 0 && counts.judges > 0;
  const hasScores = counts.submittedScores + counts.drafts + counts.conflicts > 0;
  const statusBadge =
    status === "OPEN" ? <Badge tone="green">Open</Badge> : status === "FINALIZED" ? <Badge tone="blue">Finalized</Badge> : <Badge tone="gray">Closed</Badge>;

  return (
    <div className="space-y-6">
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
      {warning.length > 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          These labelled projects are not public yet, because they still need team consent or approval: {warning.join(", ")}.
          Their labels will show in the showcase once they are approved.
        </p>
      )}

      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Judging status</h2>
            {statusBadge}
            {overview.resultsPublished && <Badge tone="amber">Results announced</Badge>}
          </div>
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-4">
          {[
            ["Judges", counts.judges],
            ["Submitted projects", counts.eligibleProjects],
            ["Scores submitted", counts.submittedScores],
            ["Conflicts", counts.conflicts],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-lg bg-slate-50 px-4 py-3">
              <dt className="text-sm text-slate-500">{label}</dt>
              <dd className="text-2xl">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {status === "CLOSED" && (
            <button onClick={() => setStatus("OPEN")} disabled={busy || !canOpen}
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
              Open judging
            </button>
          )}
          {status === "OPEN" && (
            <>
              <button onClick={() => finalize(false)} disabled={busy}
                className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
                Finalize results
              </button>
              <button onClick={() => setStatus("CLOSED")} disabled={busy}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">
                Pause judging
              </button>
            </>
          )}
          {status === "FINALIZED" && !overview.resultsPublished && (
            <button onClick={reopen} disabled={busy}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">
              Reopen scoring
            </button>
          )}
        </div>
        {status === "CLOSED" && !canOpen && (
          <p className="mt-3 text-sm text-slate-500">
            To open judging, publish the criteria below and give at least one user the judge role in{" "}
            <Link to="/admin/participants" className="font-semibold text-brand">Participants</Link>.
          </p>
        )}

        {shortfalls && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Some projects have fewer than {overview.minJudgesPerProject} submitted scores:
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm text-amber-900">
              {shortfalls.map((s) => (
                <li key={s.name}>{s.name}: {s.submitted} submitted{s.drafts > 0 ? `, ${s.drafts} still in draft` : ""}</li>
              ))}
            </ul>
            <div className="mt-3 flex gap-3">
              <button onClick={() => finalize(true)} disabled={busy}
                className="rounded-lg border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100">
                Finalize anyway
              </button>
              <button onClick={() => setShortfalls(null)} className="text-sm font-semibold text-slate-700">Keep judging</button>
            </div>
          </div>
        )}

        {status === "FINALIZED" && !overview.resultsPublished && (
          <div className="mt-5 rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-semibold">Announce results</p>
            <p className="mt-1 text-xs text-slate-500">
              Projects tied at the cutoff all get the label. Teams will see their scores and the judges' anonymous feedback.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                Winners
                <input type="number" min={1} max={10} value={winners} onChange={(e) => setWinners(Number(e.target.value))} className={`${smallInput} w-20`} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                Finalists
                <input type="number" min={0} max={20} value={finalists} onChange={(e) => setFinalists(Number(e.target.value))} className={`${smallInput} w-20`} />
              </label>
              <button onClick={announce} disabled={busy}
                className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
                Announce results
              </button>
            </div>
          </div>
        )}
      </section>

      <CriteriaEditor
        key={JSON.stringify(overview.criteria) + overview.minJudgesPerProject}
        criteria={overview.criteria}
        minJudges={overview.minJudgesPerProject}
        editable={status === "CLOSED" && !hasScores}
        finalized={status === "FINALIZED"}
        onSaved={load}
      />

      <section className={card}>
        <h2 className="text-lg font-semibold">Judges</h2>
        {overview.judges.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No judges yet. Change someone's role to Judge in <Link to="/admin/participants" className="font-semibold text-brand">Participants</Link>.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {overview.judges.map((j) => (
              <li key={j._id} className="flex items-center justify-between py-2 text-sm">
                <span><span className="font-medium">{j.name}</span> <span className="text-slate-500">· {j.email}</span></span>
                <span className="text-slate-500">{j.submitted} submitted</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConflictForm judges={overview.judges} projects={results} disabled={status === "FINALIZED"} onDone={load} />

      <ResultsPanel rows={results} status={status} minJudges={overview.minJudgesPerProject} onChanged={load} />
    </div>
  );
}