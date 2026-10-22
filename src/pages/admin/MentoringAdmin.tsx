import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../../api/client";
import TrackBadge from "../../components/TrackBadge";
import { formatDate } from "../../format";
import { card, smallInput } from "../../style";
import type { AdminMentoring, Track } from "../../type";

export default function MentoringAdmin() {
  const [data, setData] = useState<AdminMentoring | null>(null);
  const [projects, setProjects] = useState<{ _id: string; name: string }[]>([]);
  const [pick, setPick] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [directMentor, setDirectMentor] = useState("");
  const [directProject, setDirectProject] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [o, p] = await Promise.all([
        api.get("/admin/mentoring"),
        api.get("/admin/projects", { params: { limit: 100 } }),
      ]);
      setData(o.data);
      setProjects(p.data.projects.map((x: { _id: string; name: string }) => ({ _id: x._id, name: x.name })));
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(action: () => Promise<unknown>, success: string) {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await action();
      setNotice(success);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function direct(e: FormEvent) {
    e.preventDefault();
    run(async () => {
      await api.post("/admin/mentoring/assignments", { mentorId: directMentor, projectId: directProject });
      setDirectMentor("");
      setDirectProject("");
    }, "Mentor assigned. Both sides were notified.");
  }

  if (!data) return <p className="text-slate-500">{error || "Loading…"}</p>;

  const noMentors = data.mentors.length === 0;

  return (
    <div className="space-y-6">
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}

      {noMentors && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          There are no mentors yet. Change someone's role to Mentor in{" "}
          <Link to="/admin/participants" className="font-semibold underline">Participants</Link>.
        </p>
      )}

      <section>
        <h2 className="text-lg font-semibold">Mentorship requests</h2>
        {data.requests.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No pending requests.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {data.requests.map((r) => (
              <li key={r._id} className={card}>
                <div className="flex flex-wrap items-center gap-2">
                  {r.project?.track && <TrackBadge track={r.project.track as Track} />}
                  <p className="font-semibold">{r.project?.name ?? "Deleted project"}</p>
                </div>
                <p className="mt-2 text-sm"><span className="font-semibold">Topic:</span> {r.topic}</p>
                {r.message && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{r.message}</p>}
                <p className="mt-1 text-xs text-slate-500">
                  Requested by {r.requestedBy?.name ?? "a member"}{r.requestedBy?.email ? ` (${r.requestedBy.email})` : ""} on {formatDate(r.createdAt)}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <select value={pick[r._id] ?? ""} onChange={(e) => setPick({ ...pick, [r._id]: e.target.value })} className={smallInput}>
                    <option value="">Choose a mentor…</option>
                    {data.mentors.map((m) => <option key={m._id} value={m._id}>{m.name} ({m.activeTeams} teams)</option>)}
                  </select>
                  <button disabled={busy || !pick[r._id]}
                    onClick={() => run(() => api.post(`/admin/mentoring/requests/${r._id}/assign`, { mentorId: pick[r._id] }), "Mentor assigned. Both sides were notified.")}
                    className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
                    Assign
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input value={notes[r._id] ?? ""} maxLength={300} onChange={(e) => setNotes({ ...notes, [r._id]: e.target.value })}
                    placeholder="Reason for declining (optional)" className={`${smallInput} min-w-0 flex-1 basis-56`} />
                  <button disabled={busy}
                    onClick={() => run(() => api.post(`/admin/mentoring/requests/${r._id}/decline`, { note: (notes[r._id] ?? "").trim() }), "Request declined. The team was told.")}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form onSubmit={direct} className={card}>
        <h2 className="text-lg font-semibold">Assign a mentor directly</h2>
        <p className="mt-1 text-sm text-slate-500">
          A team can have up to {data.maxMentorsPerProject} mentors. A mentor can look after several teams, but not one they belong to.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <select required value={directMentor} onChange={(e) => setDirectMentor(e.target.value)} className={smallInput}>
            <option value="">Mentor…</option>
            {data.mentors.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
          <select required value={directProject} onChange={(e) => setDirectProject(e.target.value)} className={smallInput}>
            <option value="">Project…</option>
            {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <button type="submit" disabled={busy || noMentors}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
            Assign
          </button>
        </div>
      </form>

      <section className={card}>
        <h2 className="text-lg font-semibold">Active assignments</h2>
        {data.assignments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No active assignments.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {data.assignments.map((a) => (
              <li key={a._id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span>
                  <span className="font-medium">{a.mentor?.name ?? "Removed user"}</span>
                  <span className="text-slate-500"> mentors </span>
                  <span className="font-medium">{a.project?.name ?? "a deleted project"}</span>
                </span>
                <button disabled={busy}
                  onClick={() => {
                    if (window.confirm("End this assignment? The mentor loses access and future sessions are cancelled.")) {
                      run(() => api.delete(`/admin/mentoring/assignments/${a._id}`), "Assignment ended.");
                    }
                  }}
                  className="font-semibold text-red-600 hover:underline disabled:opacity-50">
                  End
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={card}>
        <h2 className="text-lg font-semibold">Mentors</h2>
        {noMentors ? (
          <p className="mt-2 text-sm text-slate-500">None yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {data.mentors.map((m) => (
              <li key={m._id} className="flex items-center justify-between py-2 text-sm">
                <span><span className="font-medium">{m.name}</span> <span className="text-slate-500">· {m.email}</span></span>
                <span className="text-slate-500">{m.activeTeams} {m.activeTeams === 1 ? "team" : "teams"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}