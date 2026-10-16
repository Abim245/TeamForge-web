import { useState } from "react";
import type { FormEvent } from "react";
import { api, errorMessage } from "../api/client";
import type { TabProps } from "../type";

export default function MilestonesTab({ data, reload }: TabProps) {
  const p = data.project;
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const body: Record<string, string> = { title: title.trim() };
      if (dueDate) body.dueDate = dueDate;
      await api.post(`/projects/${p._id}/milestones`, body);
      setTitle("");
      setDueDate("");
      reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function toggle(id: string, done: boolean) {
    setError("");
    try {
      await api.patch(`/projects/${p._id}/milestones/${id}`, { done });
      reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div>
      {!data.locked && (
        <form onSubmit={add} className="flex flex-wrap gap-2">
          <input required minLength={2} maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Milestone, e.g. Working prototype"
            className="min-w-0 flex-1 basis-48 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand" />
          <button type="submit" disabled={busy}
            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
            Add milestone
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {p.milestones.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No milestones yet. Add the phases your team plans to hit.</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {p.milestones.map((m) => {
            const overdue = !m.done && m.dueDate && new Date(m.dueDate).getTime() < Date.now();
            return (
              <li key={m._id} className="flex items-center gap-3 py-3">
                <input type="checkbox" checked={m.done} disabled={data.locked}
                  onChange={(e) => toggle(m._id, e.target.checked)} className="h-4 w-4 accent-brand" />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${m.done ? "text-slate-400 line-through" : "text-slate-900"}`}>{m.title}</p>
                  {m.dueDate && (
                    <p className={`text-xs ${overdue ? "text-red-600" : "text-slate-500"}`}>
                      Due {new Date(m.dueDate).toLocaleDateString("en-US", { dateStyle: "medium" })}{overdue ? " (overdue)" : ""}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}