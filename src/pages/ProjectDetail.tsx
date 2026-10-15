import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Lock, Plus, Send } from "lucide-react";
import { api, errorMessage } from "../api/client";
import { useAuth } from "../context/AutoContext";
import TrackBadge from "../components/TrackBadge";
import TaskItem from "../components/TaskItem";
import AddMember from "../components/AddMember";
import { TRACK_LABELS } from "../type";
import type { ProjectDetailData, Task } from "../type";

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [taskTitle, setTaskTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, t] = await Promise.all([api.get(`/projects/${id}`), api.get(`/projects/${id}/tasks`)]);
      setProject(p.data.project);
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
  if (error || !project) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft size={16} /> Project gallery
        </Link>
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error || "Project not found"}</p>
      </div>
    );
  }

  const isLead = project.lead._id === user?.id;
  const locked = project.submitted;
  const allDone = tasks.length > 0 && tasks.every((t) => t.status === "DONE");

  async function addTask(e: FormEvent) {
    e.preventDefault();
    setActionError("");
    setBusy(true);
    try {
      await api.post(`/projects/${id}/tasks`, { title: taskTitle.trim(), assigneeId });
      setTaskTitle("");
      await load();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function submitProject() {
    if (!window.confirm("Submit this project? It will be locked and nothing can be changed afterwards.")) return;
    setActionError("");
    try {
      await api.post(`/projects/${id}/submit`);
      await load();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> Project gallery
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <TrackBadge track={project.track} />
        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
          locked ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
        }`}>
          {locked ? "Submitted" : "Draft"}
        </span>
      </div>
      <h1 className="mt-3 text-4xl font-normal tracking-tight">{project.name}</h1>
      <p className="mt-2 max-w-3xl text-slate-500">{project.description}</p>

      {locked && (
        <p className="mt-6 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <Lock size={16} /> This project has been submitted and is now locked.
        </p>
      )}
      {actionError && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Tasks */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Tasks</h2>

          {isLead && !locked && (
            <form onSubmit={addTask} className="mt-4 flex flex-wrap gap-2">
              <input required minLength={3} value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="New task title"
                className="min-w-0 flex-1 basis-48 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
              <select required value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand">
                <option value="">Assign to…</option>
                {project.members.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
              <button type="submit" disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
                <Plus size={16} /> Add task
              </button>
            </form>
          )}

          {tasks.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">
              No tasks yet.{isLead && !locked ? " Add the first one above." : " The team lead will add tasks soon."}
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-slate-100">
              {tasks.map((t) => (
                <TaskItem key={t._id} task={t} onChanged={load}
                  canSubmit={!locked && t.assignee._id === user?.id} />
              ))}
            </ul>
          )}
        </section>

        {/* Team + submit */}
        <aside className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Team</h2>
            <ul className="mt-4 space-y-3">
              {project.members.map((m) => (
                <li key={m._id} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                    {m.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-slate-500">{TRACK_LABELS[m.track]}</p>
                  </div>
                  {m._id === project.lead._id && (
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-brand">Lead</span>
                  )}
                </li>
              ))}
            </ul>
            {isLead && !locked && <AddMember projectId={project._id} members={project.members} onAdded={load} />}
          </section>

          {isLead && !locked && (
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Final submission</h2>
              <p className="mt-2 text-sm text-slate-500">
                {allDone
                  ? "Every task is done. You can submit the project now."
                  : "Submit becomes available once you have at least one task and all tasks are done."}
              </p>
              <button onClick={submitProject} disabled={!allDone}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50">
                <Send size={16} /> Submit project
              </button>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}