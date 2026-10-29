import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { api, errorMessage } from "../api/client";
import { useAuth } from "../context/AutoContext";
import ProjectCard from "../components/ProjectCard";
import type { ProjectPreview, Track } from "../type";

type Scope = "showcase" | "recruiting" | "mine";
const SCOPES: Scope[] = ["showcase", "recruiting", "mine"];

const TABS: { key: Track | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "AI", label: "AI" },
  { key: "CYBERSECURITY", label: "Cybersecurity" },
  { key: "DATA_SCIENCE", label: "Data Science" },
];

const COPY: Record<Scope, { title: string; text: string; empty: string }> = {
  showcase: {
    title: "Discover what teams are building",
    text: "",
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
  const [params] = useSearchParams();
  const raw = params.get("scope");
  const scope: Scope = SCOPES.includes(raw as Scope) ? (raw as Scope) : "showcase";

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
    const query: Record<string, string> = {};
    if (scope !== "showcase") query.scope = scope;
    if (tab !== "ALL") query.track = tab;
    api
      .get("/projects", { params: query })
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
  const participant = !!user && user.role === "PARTICIPANT";

  return (
    <div className="min-h-[calc(100vh-76px)] bg-ink text-indigo-100">
      {scope === "showcase" && (
        <section className="bg-[linear-gradient(135deg,#030176_0%,#07073A_70%)]">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 md:grid-cols-[1.25fr_0.75fr] lg:px-14">
            <div>
              <p className="text-[13px] font-semibold tracking-[0.14em] text-gold">CHALLENGE PLATFORM</p>
              <h1 className="mt-3.5 font-display text-4xl font-bold leading-[1.1] text-white md:text-5xl">
                Protecting Africa's future through technology.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-indigo-200">
                Join a team, build in AI, Data Science or Cybersecurity, and show your work to the continent.
              </p>
              <div className="mt-7 flex flex-wrap gap-3.5">
                {!user && (
                  <Link to="/register" className="rounded-lg bg-gold px-6 py-3.5 font-semibold text-royal hover:opacity-90">
                    Create account
                  </Link>
                )}
                {participant && (
                  <Link to="/projects/new" className="rounded-lg bg-gold px-6 py-3.5 font-semibold text-royal hover:opacity-90">
                    Create project
                  </Link>
                )}
                <a href="#projects" className="rounded-lg border border-[#6e70d6] px-6 py-3.5 font-medium text-white hover:bg-white/5">
                  Browse projects
                </a>
              </div>
            </div>
            <div className="hidden justify-center md:flex">
              <img src="/caa-globe.jpg" alt="Cyber Ascend Africa globe"
                className="h-60 w-60 rounded-full bg-white object-cover shadow-[0_0_0_10px_#14147a,0_0_70px_rgba(235,161,25,0.35)]" />
            </div>
          </div>
        </section>
      )}

      <section id="projects" className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white md:text-[26px]">{copy.title}</h2>
            {copy.text && <p className="mt-1 text-sm text-indigo-300">{copy.text}</p>}
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`rounded-full px-4 py-2 ${
                  tab === t.key
                    ? "bg-gold font-semibold text-royal"
                    : "border border-[#3b3d9e] text-indigo-100 hover:bg-white/5"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-5 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search project name or description"
            className="w-full rounded-lg border border-[#3b3d9e] bg-ink-soft py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-indigo-300 focus:border-gold" />
        </div>

        {error && (
          <p className="mt-6 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
        )}

        {needsLogin ? (
          <div className="mt-8 rounded-2xl border border-[#26268a] bg-ink-soft p-8 text-center">
            <p className="text-indigo-100">Sign in to {scope === "mine" ? "see your projects" : "find a team"}.</p>
            <div className="mt-4 flex justify-center gap-3">
              <Link to="/login" className="rounded-lg bg-gold px-5 py-3 font-semibold text-royal hover:opacity-90">Sign in</Link>
              <Link to="/register" className="rounded-lg border border-[#6e70d6] px-5 py-3 font-medium text-white hover:bg-white/5">
                Create account
              </Link>
            </div>
          </div>
        ) : loading ? (
          <p className="mt-8 text-indigo-300">Loading projects…</p>
        ) : visible.length === 0 ? (
          <p className="mt-8 text-indigo-300">{copy.empty}</p>
        ) : (
          <>
            <p className="mt-8 text-sm text-indigo-300">
              {visible.length} {visible.length === 1 ? "project" : "projects"} found
            </p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((p) => <ProjectCard key={p._id} project={p} />)}
            </div>
          </>
        )}
      </section>
    </div>
  );
}