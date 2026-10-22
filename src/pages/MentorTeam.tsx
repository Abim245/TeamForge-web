import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { api, errorMessage } from "../api/client";
import TrackBadge from "../components/TrackBadge";
import Badge from "../components/Badge";
import ProposeSession from "../components/ProposeSession";
import SessionList from "../components/SessionList";
import FeedbackForm from "../components/FeedbackForm";
import FeedbackList from "../components/FeedbackList";
import { formatDate } from "../format";
import { card } from "../style";
import type { MentorTeamDetail } from "../type";

const isWebLink = (u: string) => /^https?:\/\//i.test(u);

export default function MentorTeam() {
  const { id } = useParams();
  const [d, setD] = useState<MentorTeamDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await api.get(`/mentoring/teams/${id}`);
      setD(r.data);
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
    <Link to="/mentoring" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
      <ArrowLeft size={16} /> All teams
    </Link>
  );

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (error || !d) {
    return (
      <div className="mx-auto max-w-3xl">
        {back}
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error || "Team not found"}</p>
      </div>
    );
  }

  const { project: p } = d;
  const s = p.submission;
  const links = [
    { label: "Repository", url: s.repoUrl },
    { label: "Demo", url: s.demoUrl },
    { label: "Presentation", url: s.presentationUrl },
    { label: "Documentation", url: s.docsUrl },
  ].filter((l) => l.url && isWebLink(l.url));
  const updates = [...p.updates].reverse();

  return (
    <div className="mx-auto max-w-6xl">
      {back}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <TrackBadge track={p.track} />
              <Badge tone={p.submitted ? "green" : "gray"}>{p.submitted ? "Submitted" : "Draft"}</Badge>
            </div>
            <h1 className="mt-3 text-3xl font-normal tracking-tight">{p.name}</h1>
            <p className="mt-1 text-slate-500">{p.description}</p>
            <p className="mt-2 text-xs text-slate-500">Read-only view. Email addresses are not shown to mentors.</p>
          </div>

          {(p.problemStatement || p.proposedSolution) && (
            <section className={`${card} grid gap-6 md:grid-cols-2`}>
              <div>
                <h2 className="font-semibold">Problem</h2>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{p.problemStatement || "—"}</p>
              </div>
              <div>
                <h2 className="font-semibold">Solution</h2>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{p.proposedSolution || "—"}</p>
              </div>
            </section>
          )}

          {(s.summary || links.length > 0) && (
            <section className={card}>
              <h2 className="text-lg font-semibold">Submission</h2>
              {s.summary && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{s.summary}</p>}
              <ul className="mt-3 space-y-2">
                {links.map((l) => (
                  <li key={l.label}>
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
            <h2 className="text-lg font-semibold">Milestones</h2>
            {p.milestones.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">None yet.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {p.milestones.map((m) => (
                  <li key={m._id} className="flex justify-between gap-3">
                    <span className={m.done ? "text-slate-400 line-through" : ""}>{m.title}</span>
                    {m.dueDate && <span className="text-slate-500">{formatDate(m.dueDate)}</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={card}>
            <h2 className="text-lg font-semibold">Tasks</h2>
            {d.tasks.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">None yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100">
                {d.tasks.map((t) => (
                  <li key={t._id} className="py-3 text-sm">
                    <p className="font-medium">
                      {t.title}
                      <span className="font-normal text-slate-500"> · {t.assignee || "Unassigned"} · {t.status === "DONE" ? "Done" : "To do"}</span>
                    </p>
                    {t.links.filter(isWebLink).map((u) => (
                      <a key={u} href={u} target="_blank" rel="noopener noreferrer"
                        className="mt-1 block break-all text-brand hover:underline">{u}</a>
                    ))}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={card}>
            <h2 className="text-lg font-semibold">Progress updates</h2>
            {updates.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No updates yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {updates.map((u) => (
                  <li key={u._id} className="rounded-lg bg-slate-50 px-4 py-3">
                    <p className="text-sm text-slate-800">{u.text}</p>
                    <p className="mt-1 text-xs text-slate-500">{u.author || "A team member"} · {formatDate(u.createdAt, true)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={card}>
            <h2 className="text-lg font-semibold">Team</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {p.members.map((m) => (
                <li key={m._id} className="text-sm">
                  <span className="font-medium">{m.name}</span>
                  {m.title && <span className="text-slate-500"> · {m.title}</span>}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <section className={`${card} space-y-4`}>
            <h2 className="text-lg font-semibold">Sessions</h2>
            <ProposeSession projectId={p._id} onCreated={load} />
            <SessionList sessions={d.sessions} onChanged={load} />
          </section>
          <section className={`${card} space-y-4`}>
            <h2 className="text-lg font-semibold">Feedback</h2>
            <FeedbackForm projectId={p._id} sessions={d.sessions} onSaved={load} />
            <FeedbackList items={d.feedback} showMentor={false} />
          </section>
        </div>
      </div>
    </div>
  );
}