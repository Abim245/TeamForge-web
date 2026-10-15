import { useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { api, errorMessage } from "../api/client";
import type { Task } from "../type";

interface Props {
  task: Task;
  canSubmit: boolean; // true only for the assigned member while the project is open
  onChanged: () => void;
}

export default function TaskItem({ task, canSubmit, onChanged }: Props) {
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const done = task.status === "DONE";

  async function submitLink(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post(`/tasks/${task._id}/uploads`, { fileUrl: link.trim() });
      setLink("");
      onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="py-4">
      <div className="flex items-start gap-3">
        {done ? (
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
        ) : (
          <Circle size={20} className="mt-0.5 shrink-0 text-slate-300" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-900">{task.title}</p>
          <p className="text-sm text-slate-500">Assigned to {task.assignee.name}</p>

          {task.uploads.map((u, i) =>
            /^https?:\/\//i.test(u.fileUrl) ? (
              <a key={i} href={u.fileUrl} target="_blank" rel="noopener noreferrer"
                className="mt-2 flex items-center gap-1.5 break-all text-sm font-medium text-brand hover:underline">
                <ExternalLink size={14} className="shrink-0" /> {u.fileUrl}
              </a>
            ) : null
          )}

          {canSubmit && (
            <form onSubmit={submitLink} className="mt-3 flex gap-2">
              <input type="url" required value={link} onChange={(e) => setLink(e.target.value)}
                placeholder="Paste a link to your work (https://…)"
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
              <button type="submit" disabled={busy}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
                {busy ? "Sending…" : done ? "Add link" : "Submit work"}
              </button>
            </form>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${
          done ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
        }`}>
          {done ? "Done" : "To do"}
        </span>
      </div>
    </li>
  );
}