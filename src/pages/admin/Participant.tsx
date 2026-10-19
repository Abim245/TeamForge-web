import { useCallback, useEffect, useState } from "react";
import { Download, Search } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { useAuth } from "../../context/AutoContext";
import { useDebounced } from "../../hooks";
import { formatDate } from "../../format";
import Pagination from "../../components/Pagination";
import { smallInput, td, th } from "../../style";
import { ROLES, TRACK_LABELS } from "../../type";
import type { AdminUser, Role, Track } from "../../type";

export default function Participants() {
  const { user: me } = useAuth();
  const [search, setSearch] = useState("");
  const [track, setTrack] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const q = useDebounced(search);
  const [data, setData] = useState<{ users: AdminUser[]; total: number; pages: number } | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api
      .get("/admin/users", { params: { search: q, track, role, page } })
      .then((r) => {
        setData(r.data);
        setError("");
      })
      .catch((e) => setError(errorMessage(e)));
  }, [q, track, role, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeRole(u: AdminUser, next: Role) {
    if (!window.confirm(`Change ${u.name}'s role to ${next}?`)) return;
    try {
      await api.patch(`/admin/users/${u._id}/role`, { role: next });
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function exportCsv() {
    try {
      const r = await api.get("/admin/users/export", { params: { search: q, track, role }, responseType: "blob" });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "participants.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name or email" className={`${smallInput} w-64 pl-9`} />
        </div>
        <select value={track} onChange={(e) => { setTrack(e.target.value); setPage(1); }} className={smallInput}>
          <option value="">All tracks</option>
          {(Object.keys(TRACK_LABELS) as Track[]).map((t) => <option key={t} value={t}>{TRACK_LABELS[t]}</option>)}
        </select>
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className={smallInput}>
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button onClick={exportCsv}
          className="ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {data && <p className="mt-4 text-sm text-slate-500">{data.total} participants</p>}

      <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className={th}>Name</th><th className={th}>Email</th><th className={th}>Track</th>
              <th className={th}>Role</th><th className={th}>Team</th><th className={th}>Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.users.map((u) => (
              <tr key={u._id}>
                <td className={`${td} font-medium`}>{u.name}</td>
                <td className={td}>{u.email}</td>
                <td className={td}>{TRACK_LABELS[u.track]}</td>
                <td className={td}>
                  <select value={u.role} disabled={u._id === me?.id}
                    onChange={(e) => changeRole(u, e.target.value as Role)} className={`${smallInput} !py-1`}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className={td}>{u.team || "—"}</td>
                <td className={td}>{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data && <Pagination page={page} pages={data.pages} onChange={setPage} />}
    </div>
  );
}