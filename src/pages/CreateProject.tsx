import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FolderPlus, Search, Users, X } from "lucide-react";
import TrackSelect from "../components/TrackSelect";
import { useAuth } from "../context/AutoContext";
import { api, errorMessage } from "../api/client";
import { inputClass, labelClass, primaryBtn } from "../style";
import type { SearchUser, Track } from "../type";

export default function CreateProject() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [track, setTrack] = useState<Track | "">("");
  const [recruiting, setRecruiting] = useState(false);
  const [lookingFor, setLookingFor] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [selected, setSelected] = useState<SearchUser[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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

  const shown = results.filter((u) => u._id !== user?.id && !selected.some((s) => s._id === u._id));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!track) return setError("Please choose a track");

    setBusy(true);
    try {
      const res = await api.post("/projects", {
        name: name.trim(),
        description: description.trim(),
        track,
        lookingForMembers: recruiting,
        lookingFor: recruiting ? lookingFor.trim() : "",
      });
      const id = res.data.project._id as string;
      // invitations are best effort: the project exists even if one fails
      await Promise.allSettled(selected.map((u) => api.post(`/projects/${id}/invitations`, { userId: u._id })));
      navigate(`/projects/${id}`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> Project gallery
      </Link>
      <p className="mt-6 text-xs font-semibold tracking-widest text-brand">NEW WORKSPACE</p>
      <h1 className="mt-1 text-4xl font-normal tracking-tight">Create a project</h1>
      <p className="mt-2 text-slate-500">Set the direction, pick your challenge track, and invite or recruit teammates.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div>
          <label htmlFor="pname" className={labelClass}>Project name <span className="text-red-600">*</span></label>
          <input id="pname" required minLength={3} maxLength={100} value={name}
            onChange={(e) => setName(e.target.value)} placeholder="Give your project a clear name" className={inputClass} />
        </div>

        <div>
          <label htmlFor="desc" className={labelClass}>Short description <span className="text-red-600">*</span></label>
          <textarea id="desc" required minLength={10} maxLength={300} rows={4} value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What problem are you solving, and what will your team build?" className={inputClass} />
        </div>

        <div className="grid items-center gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="ptrack" className={labelClass}>Challenge track <span className="text-red-600">*</span></label>
            <TrackSelect id="ptrack" value={track} onChange={setTrack} placeholder="Choose a track" />
          </div>
          <div className="flex gap-3 md:pt-7">
            <Users size={20} className="mt-0.5 shrink-0 text-brand" />
            <div>
              <p className="font-semibold text-slate-900">You'll be the team lead</p>
              <p className="text-sm text-slate-500">You manage invitations and join requests, and send the final submission.</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-800">
            <input type="checkbox" checked={recruiting} onChange={(e) => setRecruiting(e.target.checked)}
              className="h-4 w-4 accent-brand" />
            My team is looking for members
          </label>
          {recruiting && (
            <input value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} maxLength={200}
              placeholder="Who are you looking for? e.g. a designer or a data analyst"
              className={`${inputClass} mt-3`} />
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-lg font-medium"><Users size={18} /> Invite teammates</span>
            <span className="text-sm text-slate-500">Optional</span>
          </div>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email" className={`${inputClass} pl-11`} />
          </div>

          {shown.length > 0 && (
            <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
              {shown.map((u) => (
                <li key={u._id}>
                  <button type="button" onClick={() => { setSelected([...selected, u]); setSearch(""); }}
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50">
                    <span className="font-medium">{u.name}</span>
                    <span className="text-sm text-slate-500">{u.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selected.length > 0 && (
            <>
              <div className="mt-3 flex flex-wrap gap-2">
                {selected.map((u) => (
                  <span key={u._id} className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-brand">
                    {u.name}
                    <button type="button" aria-label={`Remove ${u.name}`}
                      onClick={() => setSelected(selected.filter((s) => s._id !== u._id))}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <p className="mt-2 text-sm text-slate-500">They'll get an invitation and join once they accept.</p>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/")}
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={busy} className={primaryBtn}>
            <FolderPlus size={18} /> {busy ? "Creating…" : "Create project"}
          </button>
        </div>
      </form>
    </div>
  );
}