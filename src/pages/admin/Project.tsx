import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { useDebounced } from "../../hooks";
import Badge from "../../components/Badge";
import Pagination from "../../components/Pagination";
import { smallInput, td, th } from "../../style";
import { TRACK_LABELS } from "../../type";
import type { AdminProjectRow, Track } from "../../type";

export default function AdminProjects() {
  const [params] = useSearchParams();
  const [search, setSearch] = useState("");
  const [track, setTrack] = useState("");
  const [status, setStatus] = useState(params.get("status") ?? "");
  const [approval, setApproval] = useState(params.get("approval") ?? "");
  const [page, setPage] = useState(1);
  const q = useDebounced(search);
  const [data, setData] = useState<{ projects: AdminProjectRow[]; total: number; pages: number } | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api
      .get("/admin/projects", { params: { search: q, track, status, approval, page } })
      .then((r) => {
        setData(r.data);
        setError("");
      })
      .catch((e) => setError(errorMessage(e)));
  }, [q, track, status, approval, page]);

  useEffect(() => {
    load();
  }, [load]);

  const reset = (fn: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    fn(e.target.value);
    setPage(1);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search projects" className={`${smallInput} w-64 pl-9`} />
        </div>
        <select value={track} onChange={reset(setTrack)} className={smallInput}>
          <option value="">All tracks</option>
          {(Object.keys(TRACK_LABELS) as Track[]).map((t) => <option key={t} value={t}>{TRACK_LABELS[t]}</option>)}
        </select>
        <select value={status} onChange={reset(setStatus)} className={smallInput}>
          <option value="">Any status</option>
          <option value="submitted">Submitted</option>
          <option value="draft">Draft</option>
        </select>
        <select value={approval} onChange={reset(setApproval)} className={smallInput}>
          <option value="">Any review state</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {data && <p className="mt-4 text-sm text-slate-500">{data.total} projects</p>}

      <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[820px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className={th}>Project</th><th className={th}>Track</th><th className={th}>Lead</th>
              <th className={th}>Team</th><th className={th}>State</th><th className={th} />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.projects.map((p) => (
              <tr key={p._id}>
                <td className={`${td} font-medium`}>{p.name}</td>
                <td className={td}>{TRACK_LABELS[p.track]}</td>
                <td className={td}>{p.lead?.name ?? "—"}</td>
                <td className={td}>{p.memberCount}</td>
                <td className={td}>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone={p.submitted ? "green" : "gray"}>{p.submitted ? "Submitted" : "Draft"}</Badge>
                    {p.publicConsent && <Badge tone="blue">Consent</Badge>}
                    {p.submitted && p.publicConsent && p.approvalStatus === "PENDING" && <Badge tone="amber">Needs review</Badge>}
                    {p.approvalStatus === "APPROVED" && <Badge tone="green">Approved</Badge>}
                    {p.approvalStatus === "REJECTED" && <Badge tone="red">Rejected</Badge>}
                    {p.label !== "NONE" && <Badge tone="amber">{p.label === "WINNER" ? "Winner" : "Finalist"}</Badge>}
                  </div>
                </td>
                <td className={td}>
                  <Link to={`/admin/projects/${p._id}`} className="font-semibold text-brand hover:underline">Review</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data && <Pagination page={page} pages={data.pages} onChange={setPage} />}
    </div>
  );
}