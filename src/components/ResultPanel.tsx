import { Fragment, useState } from "react";
import { Download } from "lucide-react";
import { api, errorMessage } from "../api/client";
import Badge from "./Badge";
import { td, th } from "../style";
import { TRACK_LABELS } from "../type";
import type { JudgingStatus, ResultRow } from "../type";

interface Props {
  rows: ResultRow[];
  status: JudgingStatus;
  minJudges: number;
  onChanged: () => void;
}

export default function ResultsPanel({ rows, status, minJudges, onChanged }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function act(action: () => Promise<unknown>) {
    setError("");
    try {
      await action();
      onChanged();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function exportCsv() {
    try {
      const r = await api.get("/admin/judging/results/export", { responseType: "blob" });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "judging-results.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Consolidated results</h2>
        <button onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">
          <Download size={16} /> Export CSV
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No submitted projects yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className={th}>Rank</th><th className={th}>Project</th><th className={th}>Track</th>
                <th className={th}>Judges</th><th className={th}>Conflicts</th><th className={th}>Average</th><th className={th} />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <Fragment key={r.projectId}>
                  <tr>
                    <td className={`${td} font-semibold`}>{r.rank ?? "—"}</td>
                    <td className={`${td} font-medium`}>{r.name}</td>
                    <td className={td}>{TRACK_LABELS[r.track]}</td>
                    <td className={td}>
                      {r.judgeCount}
                      {r.judgeCount < minJudges && <span className="ml-2"><Badge tone="amber">Needs judges</Badge></span>}
                    </td>
                    <td className={td}>{r.conflicts}</td>
                    <td className={td}>{r.average ?? "—"}</td>
                    <td className={td}>
                      <button onClick={() => setOpen(open === r.projectId ? null : r.projectId)}
                        className="font-semibold text-brand hover:underline">
                        {open === r.projectId ? "Hide" : "Details"}
                      </button>
                    </td>
                  </tr>
                  {open === r.projectId && (
                    <tr>
                      <td colSpan={7} className="bg-slate-50 px-4 py-4">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <p className="text-sm font-semibold">Average by criterion</p>
                            <ul className="mt-2 space-y-1 text-sm">
                              {r.perCriterion.map((c) => (
                                <li key={c.criterion} className="flex justify-between">
                                  <span>{c.name}</span><span className="text-slate-500">{c.average} / {c.maxScore}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Judges</p>
                            {r.judges.length === 0 ? (
                              <p className="mt-2 text-sm text-slate-500">Nobody has started on this project.</p>
                            ) : (
                              <ul className="mt-2 space-y-2 text-sm">
                                {r.judges.map((j) => (
                                  <li key={j.scoreId} className="flex flex-wrap items-center justify-between gap-2">
                                    <span>
                                      {j.name}{" "}
                                      <span className="text-slate-500">
                                        {j.status === "SUBMITTED" ? `· ${j.total}` : j.status === "CONFLICT" ? `· conflict (${j.conflictBy === "ADMIN" ? "admin" : "judge"})` : "· draft"}
                                      </span>
                                    </span>
                                    <span className="flex gap-3">
                                      {j.status === "SUBMITTED" && status === "OPEN" && (
                                        <button onClick={() => act(() => api.post(`/admin/judging/scores/${j.scoreId}/reopen`))}
                                          className="font-semibold text-brand hover:underline">Reopen</button>
                                      )}
                                      {j.status === "CONFLICT" && status !== "FINALIZED" && (
                                        <button onClick={() => act(() => api.delete(`/admin/judging/conflicts/${j.scoreId}`))}
                                          className="font-semibold text-red-600 hover:underline">Clear conflict</button>
                                      )}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}