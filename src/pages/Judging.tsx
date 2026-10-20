import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../api/client";
import Badge from "../components/Badge";
import TrackBadge from "../components/TrackBadge";
import CriteriaCard from "../components/CriteriaCard";
import { card, smallInput } from "../style";
import { TRACK_LABELS } from "../type";
import type { JudgeProjectRow, JudgingStatus, ScoreStatus, Track } from "../type";

const STATUS: Record<ScoreStatus, { text: string; tone: "gray" | "amber" | "green" | "red" }> = {
  NOT_STARTED: { text: "Not started", tone: "gray" },
  DRAFT: { text: "Draft", tone: "amber" },
  SUBMITTED: { text: "Submitted", tone: "green" },
  CONFLICT: { text: "Conflict", tone: "red" },
};

export default function Judging() {
  const [status, setStatus] = useState<JudgingStatus>("CLOSED");
  const [projects, setProjects] = useState<JudgeProjectRow[]>([]);
  const [track, setTrack] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/judging/projects")
      .then((r) => {
        setStatus(r.data.status);
        setProjects(r.data.projects);
      })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => (track ? projects.filter((p) => p.track === track) : projects), [projects, track]);
  const done = projects.filter((p) => p.status === "SUBMITTED" || p.status === "CONFLICT").length;

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-xs font-semibold tracking-widest text-brand">JUDGING</p>
      <h1 className="mt-1 text-4xl font-normal tracking-tight">Projects to judge</h1>

      {error && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="mt-6 text-slate-500">Loading…</p>}

      {!loading && status === "CLOSED" && (
        <div className={`${card} mt-6`}>
          <p className="font-semibold">Judging has not opened yet.</p>
          <p className="mt-1 text-sm text-slate-600">You will get a notification when it opens. The criteria are below.</p>
        </div>
      )}

      {!loading && status === "FINALIZED" && (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Results are finalized. Scoring is locked.
        </p>
      )}

      {!loading && status !== "CLOSED" && (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">{done} of {projects.length} projects done</p>
            <select value={track} onChange={(e) => setTrack(e.target.value)} className={smallInput}>
              <option value="">All tracks</option>
              {(Object.keys(TRACK_LABELS) as Track[]).map((t) => <option key={t} value={t}>{TRACK_LABELS[t]}</option>)}
            </select>
          </div>

          {visible.length === 0 ? (
            <p className="mt-6 text-slate-500">No projects to show.</p>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {visible.map((p) => {
                const s = STATUS[p.status];
                return (
                  <li key={p._id} className={card}>
                    <div className="flex items-center justify-between gap-2">
                      <TrackBadge track={p.track} />
                      <Badge tone={s.tone}>{s.text}</Badge>
                    </div>
                    <h3 className="mt-4 text-lg font-medium">{p.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{p.description}</p>
                    <Link to={`/judging/${p._id}`} className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
                      {p.status === "SUBMITTED" || status === "FINALIZED" ? "View" : p.status === "CONFLICT" ? "View" : "Review and score"}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <CriteriaCard />
    </div>
  );
}