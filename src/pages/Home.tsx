import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { api, errorMessage } from "../api/client";
import { useAuth } from "../context/AutoContext";
import ProjectCard from "../components/ProjectCard";
import { primaryBtn } from "../style";
import type { ProjectPreview, Track } from "../type";

type Scope = "showcase" | "recruiting" | "mine";

const SCOPES: { key: Scope; label: string }[] = [
  { key: "showcase", label: "Showcase" },
  { key: "recruiting", label: "Find a team" },
  { key: "mine", label: "My projects" },
];

const TABS: { key: Track | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "AI", label: "AI" },
  { key: "CYBERSECURITY", label: "Cybersecurity" },
  { key: "DATA_SCIENCE", label: "Data Science" },
];

const COPY: Record<Scope, { title: string; text: string; empty: string }> = {
  showcase: {
    title: "Discover what teams are building",
    text: "Approved projects from this year's challenge.",
    empty: "No approved projects yet. Check back soon.",
  },
  recruiting: {
    title: "Find a team",
    text: "These teams are looking for members. Send a request to join.",
    empty: "No teams are recruiting right now.",
  },
  mine: {
    title: "My projects",
    text: "Projects you lead or belong to, with their review status.",
    empty: "You are not on a project yet. Create one, or find a team that is recruiting.",
  },
};

export default function Home() {
  const { user } = useAuth();
  const [scope, setScope] = useState<Scope>("showcase");
  const [tab, setTab] = useState<Track | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<ProjectPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (scope !== "showcase" && !user) {
      setProjects([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    const params: Record<string, string> = {};
    if (scope !== "showcase") params.scope = scope;
    if (tab !== "ALL") params.track = tab;
    api
      .get("/projects", { params })
      .then((r) => setProjects(r.data.projects))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [scope, tab, user]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }, [projects, query]);

  const copy = COPY[scope];
  const needsLogin = scope !== "showcase" && !user;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-brand">COMMUNITY PROJECTS</p>
          <h1 className="mt-2 text-4xl font-normal tracking-tight">{copy.title}</h1>
          <p className="mt-3 text-slate-500">{copy.text}</p>
        </div>
        <Link to="/projects/new" className={primaryBtn}><Plus size={18} /> Create project</Link>
      </div>

      <div className="mt-8 flex gap-1 overflow-x-auto border-b border-slate-200">
        {SCOPES.map((s) => (
          <button key={s.key} onClick={() => setScope(s.key)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold ${
              scope === s.key ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search project name or description"
            className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold ${
                tab === t.key ? "bg-navy text-white" : "text-slate-600 hover:bg-slate-50"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {needsLogin ? (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">Sign in to {scope === "mine" ? "see your projects" : "find a team"}.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link to="/login" className={primaryBtn}>Sign in</Link>
            <Link to="/register" className="rounded-lg border border-slate-300 px-5 py-3 font-semibold">Create account</Link>
          </div>
        </div>
      ) : loading ? (
        <p className="mt-8 text-slate-500">Loading projects…</p>
      ) : visible.length === 0 ? (
        <p className="mt-8 text-slate-500">{copy.empty}</p>
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