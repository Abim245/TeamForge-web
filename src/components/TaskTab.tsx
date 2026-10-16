import { useState } from "react";
import type { FormEvent } from "react";
import { api, errorMessage } from "../api/client";
import TaskItem from "./TaskItem";
import type { Task, TabProps } from "../type";

export default function TasksTab({ data, reload, tasks }: TabProps & { tasks: Task[] }) {
  const p = data.project;
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function addTask(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post(`/projects/${p._id}/tasks`, { title: title.trim(), assigneeId });
      setTitle("");
      reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {!data.locked && (
        <form onSubmit={addTask} className="flex flex-wrap gap-2">
          <input required minLength={3} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New task title"
            className="min-w-0 flex-1 basis-48 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
          <select required value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand">
            <option value="">Assign to…</option>
            {p.members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
          <button type="submit" disabled={busy}
            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
            Add task
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {tasks.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No tasks yet. Any team member can add the first one.</p>
      ) : (
        <ul className="mt-2 divide-y divide-slate-100">
          {tasks.map((t) => <TaskItem key={t._id} task={t} onChanged={reload} canSubmit={!data.locked} />)}
        </ul>
      )}
    </div>
  );
}