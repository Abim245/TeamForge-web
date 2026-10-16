import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api, errorMessage } from "../api/client";
import type { Member, SearchUser } from "../type";

interface Props {
  projectId: string;
  members: Member[];
}

export default function InviteMember({ projectId, members }: Props) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (search.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      api.get("/users", { params: { search: search.trim() } })
        .then((r) => setResults(r.data.users))
        .catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const shown = results.filter((u) => !members.some((m) => m._id === u._id));

  async function invite(u: SearchUser) {
    setError("");
    setNotice("");
    try {
      await api.post(`/projects/${projectId}/invitations`, { userId: u._id });
      setNotice(`Invitation sent to ${u.name}`);
      setSearch("");
      setResults([]);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="mt-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Invite by name or email"
          className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {notice && <p className="mt-2 text-sm text-emerald-700">{notice}</p>}
      {shown.length > 0 && (
        <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {shown.map((u) => (
            <li key={u._id}>
              <button type="button" onClick={() => invite(u)} className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50">
                <span className="font-medium">{u.name}</span>
                <span className="block text-xs text-slate-500">{u.email}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}