import { useState } from "react";
import type { FormEvent } from "react";
import { api, errorMessage } from "../api/client";
import type { TabProps } from "../type";

export default function UpdatesFeed({ data, reload }: TabProps) {
  const p = data.project;
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function post(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post(`/projects/${p._id}/updates`, { text: text.trim() });
      setText("");
      reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const updates = [...p.updates].reverse();

  return (
    <div>
      <h3 className="text-lg font-semibold">Progress updates</h3>
      {!data.locked && (
        <form onSubmit={post} className="mt-3">
          <textarea rows={2} maxLength={1000} required minLength={2} value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Share what the team did or learned"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy}
            className="mt-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
            {busy ? "Posting…" : "Post update"}
          </button>
        </form>
      )}
      {updates.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No updates yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {updates.map((u) => (
            <li key={u._id} className="rounded-lg bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-800">{u.text}</p>
              <p className="mt-1 text-xs text-slate-500">
                {u.author?.name ?? "Former member"} · {new Date(u.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}