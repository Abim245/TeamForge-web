import { useState } from "react";
import type { FormEvent } from "react";
import { api, errorMessage } from "../api/client";
import { card, smallInput } from "../style";
import type { ResultRow } from "../type";

interface Props {
  judges: { _id: string; name: string }[];
  projects: ResultRow[];
  disabled: boolean;
  onDone: () => void;
}

export default function ConflictForm({ judges, projects, disabled, onDone }: Props) {
  const [judgeId, setJudgeId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    try {
      await api.post("/admin/judging/conflicts", { judgeId, projectId, note: note.trim() });
      setNotice("Conflict recorded. The judge cannot see or score that project.");
      setJudgeId("");
      setProjectId("");
      setNote("");
      onDone();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <form onSubmit={submit} className={card}>
      <h2 className="text-lg font-semibold">Record a conflict of interest</h2>
      <p className="mt-1 text-sm text-slate-500">
        Use this when a judge is connected to a team. The judge is excluded from that project and cannot undo it. Any scores they already gave for it are removed.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <select required value={judgeId} onChange={(e) => setJudgeId(e.target.value)} disabled={disabled} className={smallInput}>
          <option value="">Judge…</option>
          {judges.map((j) => <option key={j._id} value={j._id}>{j.name}</option>)}
        </select>
        <select required value={projectId} onChange={(e) => setProjectId(e.target.value)} disabled={disabled} className={smallInput}>
          <option value="">Project…</option>
          {projects.map((p) => <option key={p.projectId} value={p.projectId}>{p.name}</option>)}
        </select>
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} disabled={disabled}
          placeholder="Reason (optional)" className={`${smallInput} min-w-0 flex-1 basis-48`} />
        <button type="submit" disabled={disabled}
          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">
          Record conflict
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {notice && <p className="mt-3 text-sm text-emerald-700">{notice}</p>}
    </form>
  );
}