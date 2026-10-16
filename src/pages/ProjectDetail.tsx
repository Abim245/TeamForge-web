import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api, errorMessage } from "../api/client";
import { useAuth } from "../context/AutoContext";
import TrackBadge from "../components/TrackBadge";
import DeadlineBanner from "../components/Deadline";
import OverviewTab from "../components/OverviewTab";
import UpdatesFeed from "../components/UpdateFeed";
import TasksTab from "../components/TaskTab";
import MilestonesTab from "../components/Milestone";
import SubmissionTab from "../components/SubmissionTab";
import TeamPanel from "../components/TeamPanel";
import type { Task, WorkspaceData } from "../type";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "tasks", label: "Tasks" },
  { key: "milestones", label: "Milestones" },
  { key: "submission", label: "Submission" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [data, setData] = useState<WorkspaceData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tab, setTab] = useState<TabKey>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [p, t] = await Promise.all([api.get(`/projects/${id}`), api.get(`/projects/${id}/tasks`)]);
      setData({ project: p.data.project, locked: p.data.locked, settings: p.data.settings });
      setTasks(t.data.tasks);
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

  if (loading) return <p className="text-slate-500">Loading project…</p>;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft size={16} /> Project gallery
        </Link>
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error || "Project not found"}</p>
      </div>
    );
  }

  const p = data.project;
  const isLead = p.lead._id === user?.id;
  const tabProps = { data, isLead, reload: load };

  return (
    <div className="mx-auto max-w-6xl">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> Project gallery
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <TrackBadge track={p.track} />
        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
          p.submitted ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
        }`}>
          {p.submitted ? "Submitted" : "Draft"}
        </span>
      </div>
      <h1 className="mt-3 text-4xl font-normal tracking-tight">{p.name}</h1>
      <p className="mt-2 max-w-3xl text-slate-500">{p.description}</p>

      <DeadlineBanner deadline={data.settings.submissionDeadline} locked={data.locked} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold ${
                  tab === t.key ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="space-y-10">
              <OverviewTab {...tabProps} />
              <UpdatesFeed {...tabProps} />
            </div>
          )}
          {tab === "tasks" && <TasksTab {...tabProps} tasks={tasks} />}
          {tab === "milestones" && <MilestonesTab {...tabProps} />}
          {tab === "submission" && <SubmissionTab {...tabProps} />}
        </section>

        <aside>
          <TeamPanel {...tabProps} />
        </aside>
      </div>
    </div>
  );
}