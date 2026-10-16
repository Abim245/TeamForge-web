import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { api, errorMessage } from "../api/client";
import ProjectCard from "../components/ProjectCard";
import { primaryBtn } from "../style";
import type { ProjectPreview, Track } from "../type";

const TABS: { key: Track | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "AI", label: "AI" },
  { key: "CYBERSECURITY", label: "Cybersecurity" },
  { key: "DATA_SCIENCE", label: "Data Science" },
];

export default function Home() {
  const [tab, setTab] = useState<Track | "ALL">("ALL");
  const [looking, setLooking] = useState(false);
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<ProjectPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const params: Record<string, string> = {};
    if (tab !== "ALL") params.track = tab;
    if (looking) params.looking = "true";
    api
      .get("/projects", { params })
      .then((r) => setProjects(r.data.projects))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [tab, looking]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }, [projects, query]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-brand">COMMUNITY PROJECTS</p>
          <h1 className="mt-2 text-4xl font-normal tracking-tight">Discover what teams are building</h1>
          <p className="mt-3 text-slate-500">
            Browse projects, or find a team that is looking for members and ask to join.
          </p>
        </div>
        <Link to="/projects/new" className={primaryBtn}><Plus size={18} /> Create project</Link>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search project name or description"
            className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setLooking(!looking)}
            className={`rounded-lg border px-4 py-2.5 text-sm font-semibold ${
              looking ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600"
            }`}>
            Looking for members
          </button>
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`rounded-md px-4 py-2 text-sm font-semibold ${
                  tab === t.key ? "bg-navy text-white" : "text-slate-600 hover:bg-slate-50"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="mt-8 text-slate-500">Loading projects…</p>
      ) : (
        <>
          <p className="mt-8 text-sm text-slate-500">
            {visible.length} {visible.length === 1 ? "project" : "projects"} found
          </p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => <ProjectCard key={p._id} project={p} />)}
          </div>
        </>
      )}
    </div>
  );
}