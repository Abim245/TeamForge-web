import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, errorMessage } from "../api/client";
import Badge from "./Badge";
import ProposeSession from "./ProposeSession";
import SessionList from "./SessionList";
import FeedbackList from "./FeedbackList";
import { formatDate } from "../format";
import { smallInput } from "../style";
import type { MentoringData, TabProps } from "../type";

export default function MentoringTab({ data }: TabProps) {
  const projectId = data.project._id;
  const [m, setM] = useState<MentoringData | null>(null);
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api.get(`/projects/${projectId}/mentoring`);
      setM(r.data);
      setLoadError("");
    } catch (err) {
      setLoadError(errorMessage(err));
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function request(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post(`/projects/${projectId}/mentorship-requests`, { topic: topic.trim(), message: message.trim() });
      setTopic("");
      setMessage("");
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (loadError) return <p className="text-red-600">{loadError}</p>;
  if (!m) return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold">Your mentors</h3>
        {m.mentors.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {m.mentors.map((x) => <li key={x._id}><Badge tone="blue">{x.name}</Badge></li>)}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">Your team does not have a mentor yet.</p>
        )}

        {m.request?.status === "PENDING" && (
          <div className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Request sent on {formatDate(m.request.createdAt)} for "{m.request.topic}". An administrator will assign a mentor.
          </div>
        )}
        {m.request?.status === "DECLINED" && (
          <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
            Your last request was declined{m.request.note ? `: ${m.request.note}` : "."}
          </div>
        )}

        {m.canRequest && (
          <form onSubmit={request} className="mt-4 space-y-3 rounded-lg border border-slate-200 p-4">
            <p className="font-semibold">Request a mentor</p>
            <input required minLength={3} maxLength={120} value={topic} onChange={(e) => setTopic(e.target.value)}
              placeholder="What do you need help with?" className={`${smallInput} w-full`} />
            <textarea rows={3} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Anything else the organizers should know (optional)" className={`${smallInput} w-full`} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={busy}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
              {busy ? "Sending…" : "Send request"}
            </button>
          </form>
        )}
      </section>

      {m.mentors.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Sessions</h3>
          <ProposeSession projectId={projectId} mentors={m.mentors} onCreated={load} />
          <SessionList sessions={m.sessions} onChanged={load} />
        </section>
      )}

      <section>
        <h3 className="text-lg font-semibold">Mentor feedback</h3>
        <div className="mt-3">
          <FeedbackList items={m.feedback} showMentor />
        </div>
      </section>
    </div>
  );
}