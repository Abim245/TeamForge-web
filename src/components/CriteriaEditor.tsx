import { useState } from "react";
import { api, errorMessage } from "../api/client";
import { card, smallInput } from "../style";
import type { Criterion } from "../type";

interface Row {
  name: string;
  description: string;
  weight: string;
  maxScore: string;
}

const SUGGESTED: Row[] = [
  { name: "Innovation", description: "How original is the idea and the approach?", weight: "25", maxScore: "10" },
  { name: "Technical execution", description: "How well is it built, and does it work?", weight: "25", maxScore: "10" },
  { name: "Impact", description: "How useful is it for real people?", weight: "25", maxScore: "10" },
  { name: "Presentation", description: "How clearly is it explained and demonstrated?", weight: "25", maxScore: "10" },
];

interface Props {
  criteria: Criterion[];
  minJudges: number;
  editable: boolean; // false once judging has opened or any score exists
  finalized: boolean;
  onSaved: () => void;
}

export default function CriteriaEditor({ criteria, minJudges, editable, finalized, onSaved }: Props) {
  const [rows, setRows] = useState<Row[]>(
    criteria.map((c) => ({ name: c.name, description: c.description, weight: String(c.weight), maxScore: String(c.maxScore) }))
  );
  const [min, setMin] = useState(String(minJudges));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const totalWeight = rows.reduce((sum, r) => sum + (Number(r.weight) || 0), 0);

  function update(i: number, patch: Partial<Row>) {
    setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  async function save() {
    setError("");
    setNotice("");
    const body: Record<string, unknown> = { minJudgesPerProject: Number(min) };
    if (editable) {
      const criteriaPayload = [];
      for (const r of rows) {
        const weight = Number(r.weight);
        const maxScore = Number(r.maxScore);
        if (r.name.trim().length < 2) return setError("Every criterion needs a name");
        if (!(weight >= 1 && weight <= 100)) return setError(`${r.name}: weight must be between 1 and 100`);
        if (!(maxScore >= 1 && maxScore <= 100)) return setError(`${r.name}: max score must be between 1 and 100`);
        criteriaPayload.push({ name: r.name.trim(), description: r.description.trim(), weight, maxScore });
      }
      if (criteriaPayload.length === 0) return setError("Add at least one criterion");
      body.criteria = criteriaPayload;
    }
    setBusy(true);
    try {
      await api.patch("/admin/judging/config", body);
      setNotice("Saved");
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={card}>
      <h2 className="text-lg font-semibold">Judging criteria</h2>
      <p className="mt-1 text-sm text-slate-500">
        Everyone can see these. Weights are relative, so they do not have to add up to 100.
        {!editable && " Criteria are locked once judging opens or scoring starts."}
      </p>

      <div className="mt-4 space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-3">
            <div className="flex flex-wrap gap-2">
              <input value={r.name} disabled={!editable} onChange={(e) => update(i, { name: e.target.value })}
                placeholder="Name" className={`${smallInput} min-w-0 flex-1 basis-40`} />
              <label className="flex items-center gap-1.5 text-sm text-slate-500">
                Weight
                <input type="number" min={1} max={100} value={r.weight} disabled={!editable}
                  onChange={(e) => update(i, { weight: e.target.value })} className={`${smallInput} w-20`} />
              </label>
              <label className="flex items-center gap-1.5 text-sm text-slate-500">
                Max score
                <input type="number" min={1} max={100} value={r.maxScore} disabled={!editable}
                  onChange={(e) => update(i, { maxScore: e.target.value })} className={`${smallInput} w-20`} />
              </label>
              {editable && (
                <button onClick={() => setRows(rows.filter((_, idx) => idx !== i))}
                  className="text-sm font-semibold text-red-600 hover:underline">Remove</button>
              )}
            </div>
            <input value={r.description} disabled={!editable} onChange={(e) => update(i, { description: e.target.value })}
              placeholder="What judges should look for" className={`${smallInput} mt-2 w-full`} />
            {totalWeight > 0 && (
              <p className="mt-1 text-xs text-slate-500">Counts for {Math.round(((Number(r.weight) || 0) / totalWeight) * 100)}% of the total</p>
            )}
          </div>
        ))}
      </div>

      {editable && (
        <div className="mt-3 flex flex-wrap gap-3">
          <button onClick={() => setRows([...rows, { name: "", description: "", weight: "25", maxScore: "10" }])}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
            Add criterion
          </button>
          {rows.length === 0 && (
            <button onClick={() => setRows(SUGGESTED)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
              Use suggested criteria
            </button>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold">
          Minimum judges per project
          <input type="number" min={1} max={20} value={min} disabled={finalized}
            onChange={(e) => setMin(e.target.value)} className={`${smallInput} w-20`} />
        </label>
        <button onClick={save} disabled={busy || finalized}
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {notice && <p className="mt-3 text-sm text-emerald-700">{notice}</p>}
    </section>
  );
}