import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../api/client";
import Badge from "../components/Badge";
import TrackBadge from "../components/TrackBadge";
import SessionList from "../components/SessionList";
import { card } from "../style";
import type { MentorTeamRow, SessionItem } from "../type";

export default function Mentoring() {
  const [teams, setTeams] = useState<MentorTeamRow[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [t, s] = await Promise.all([api.get("/mentoring/teams"), api.get("/mentoring/sessions")]);
      setTeams(t.data.projects);
      setSessions(s.data.sessions);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-xs font-semibold tracking-widest text-brand">MENTORING</p>
      <h1 className="mt-1 text-4xl font-normal tracking-tight">Your teams</h1>

      {error && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="mt-6 text-slate-500">Loading…</p>}

      {!loading && teams.length === 0 && (
        <p className="mt-6 text-slate-500">You have not been assigned to a team yet. You will get a notification when you are.</p>
      )}

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {teams.map((t) => (
          <li key={t._id} className={card}>
            <div className="flex items-center justify-between gap-2">
              <TrackBadge track={t.track} />
              <Badge tone={t.submitted ? "green" : "gray"}>{t.submitted ? "Submitted" : "Draft"}</Badge>
            </div>
            <h3 className="mt-4 text-lg font-medium">{t.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{t.description}</p>
            <p className="mt-2 text-xs text-slate-500">{t.memberCount} {t.memberCount === 1 ? "member" : "members"}</p>
            <Link to={`/mentoring/teams/${t._id}`} className="mt-3 inline-block text-sm font-semibold text-brand hover:underline">
              Open team
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Sessions</h2>
        <div className="mt-3">
          <SessionList sessions={sessions} onChanged={load} />
        </div>
      </section>
    </div>
  );
}