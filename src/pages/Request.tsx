import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, errorMessage } from "../api/client";
import TrackBadge from "../components/TrackBadge";
import type { Member, Track } from "../type";

interface Invitation {
  _id: string;
  project: { _id: string; name: string; description: string; track: Track };
}
interface JoinRequest {
  _id: string;
  message: string;
  project: { _id: string; name: string };
  user: Member;
}

export default function Requests() {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await api.get("/requests");
      setInvitations(r.data.invitations);
      setJoinRequests(r.data.joinRequests);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function answer(id: string, action: "accept" | "decline", openProjectId?: string) {
    setError("");
    try {
      await api.post(`/requests/${id}/${action}`);
      if (action === "accept" && openProjectId) return navigate(`/projects/${openProjectId}`);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const btn = "rounded-lg px-4 py-2 text-sm font-semibold";

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-semibold tracking-widest text-brand">INBOX</p>
      <h1 className="mt-1 text-4xl font-normal tracking-tight">Requests</h1>
      <p className="mt-2 text-slate-500">Invitations to join teams, and people asking to join yours.</p>

      {error && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="mt-6 text-slate-500">Loading…</p>}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Invitations for you</h2>
        {invitations.length === 0 && !loading && <p className="mt-3 text-sm text-slate-500">No pending invitations.</p>}
        <ul className="mt-3 space-y-3">
          {invitations.map((i) => (
            <li key={i._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <TrackBadge track={i.project.track} />
                <p className="font-medium">{i.project.name}</p>
              </div>
              <p className="mt-2 text-sm text-slate-500">{i.project.description}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => answer(i._id, "accept", i.project._id)} className={`${btn} bg-brand text-white hover:bg-brand-dark`}>Accept</button>
                <button onClick={() => answer(i._id, "decline")} className={`${btn} border border-slate-300`}>Decline</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Join requests for your teams</h2>
        {joinRequests.length === 0 && !loading && <p className="mt-3 text-sm text-slate-500">No pending requests.</p>}
        <ul className="mt-3 space-y-3">
          {joinRequests.map((r) => (
            <li key={r._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="font-medium">{r.user.name} <span className="font-normal text-slate-500">wants to join {r.project.name}</span></p>
              <p className="mt-1 text-sm text-slate-500">{r.user.email}</p>
              {r.message && <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{r.message}</p>}
              <div className="mt-4 flex gap-2">
                <button onClick={() => answer(r._id, "accept")} className={`${btn} bg-brand text-white hover:bg-brand-dark`}>Accept</button>
                <button onClick={() => answer(r._id, "decline")} className={`${btn} border border-slate-300`}>Decline</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}