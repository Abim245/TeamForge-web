import { useEffect, useState } from "react";
import { api, errorMessage } from "../api/client";
import Badge from "../components/Badge";
import { formatDate } from "../format";
import { card } from "../style";
import CriteriaCard from "../components/CriteriaCard";
import type { AnnouncementItem, SettingsData } from "../type";

interface KeyDate {
  key: string;
  title: string;
  when: string;
  kind: "DEADLINE" | "PRESENTATION";
  body?: string;
}

export default function Announcements() {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/announcements"), api.get("/settings")])
      .then(([a, s]) => {
        setItems(a.data.announcements);
        setSettings(s.data.settings);
      })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const dates: KeyDate[] = items
    .filter((a) => a.kind !== "ANNOUNCEMENT" && a.eventDate)
    .map((a) => ({ key: a._id, title: a.title, when: a.eventDate as string, kind: a.kind as KeyDate["kind"], body: a.body }));
  if (settings?.submissionDeadline) {
    dates.push({ key: "deadline", title: "Project submissions close", when: settings.submissionDeadline, kind: "DEADLINE" });
  }
  dates.sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime());

  const posts = items.filter((a) => a.kind === "ANNOUNCEMENT");

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-xs font-semibold tracking-widest text-brand">COMPETITION</p>
      <h1 className="mt-1 text-4xl font-normal tracking-tight">Announcements and key dates</h1>

      {error && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="mt-6 text-slate-500">Loading…</p>}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Key dates</h2>
        {!loading && dates.length === 0 && <p className="mt-3 text-sm text-slate-500">No dates have been published yet.</p>}
        <ul className="mt-3 space-y-3">
          {dates.map((d) => {
            const past = new Date(d.when).getTime() < Date.now();
            return (
              <li key={d.key} className={`${card} ${past ? "opacity-60" : ""}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={d.kind === "DEADLINE" ? "red" : "blue"}>{d.kind === "DEADLINE" ? "Deadline" : "Presentation"}</Badge>
                  <p className="font-semibold">{d.title}</p>
                </div>
                <p className="mt-2 text-sm text-slate-600">{formatDate(d.when, true)}{past ? " (past)" : ""}</p>
                {d.body && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{d.body}</p>}
              </li>
            );
          })}
        </ul>
      </section>
      <CriteriaCard />
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Announcements</h2>
        {!loading && posts.length === 0 && <p className="mt-3 text-sm text-slate-500">No announcements yet.</p>}
        <ul className="mt-3 space-y-3">
          {posts.map((a) => (
            <li key={a._id} className={card}>
              <p className="font-semibold">{a.title}</p>
              <p className="mt-1 text-xs text-slate-500">{formatDate(a.createdAt, true)}</p>
              {a.body && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{a.body}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}