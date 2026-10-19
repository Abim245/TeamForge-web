import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../../api/client";
import { card } from "../../style";
import { TRACK_LABELS } from "../../type";
import type { AdminStats, Track } from "../../type";

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data)).catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!stats) return <p className="text-slate-500">Loading…</p>;

  const cards = [
    { label: "Participants", value: stats.users, to: "/admin/participants" },
    { label: "Projects", value: stats.projects, to: "/admin/projects" },
    { label: "Submitted", value: stats.submitted, to: "/admin/projects?status=submitted" },
    { label: "Awaiting review", value: stats.awaitingReview, to: "/admin/projects?status=submitted&approval=PENDING" },
    { label: "Public in showcase", value: stats.approved, to: "/admin/projects?approval=APPROVED" },
    { label: "Teams recruiting", value: stats.recruiting, to: "/admin/projects" },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className={`${card} hover:border-brand`}>
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-2 text-4xl font-normal">{c.value}</p>
          </Link>
        ))}
      </div>
      <section className={`${card} mt-6`}>
        <h2 className="text-lg font-semibold">Participants by track</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {(Object.keys(TRACK_LABELS) as Track[]).map((t) => (
            <li key={t} className="rounded-lg bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-500">{TRACK_LABELS[t]}</p>
              <p className="text-2xl">{stats.usersByTrack[t] ?? 0}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}