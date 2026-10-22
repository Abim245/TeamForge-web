import { useState } from "react";
import type { FormEvent } from "react";
import { api, errorMessage } from "../api/client";
import { toLocalInput } from "../format";
import { smallInput } from "../style";
import type { MentorRef } from "../type";

interface Props {
  projectId: string;
  mentors?: MentorRef[]; // team side picks a mentor; mentor side leaves this out
  onCreated: () => void;
}

export default function ProposeSession({ projectId, mentors, onCreated }: Props) {
  const [mentorId, setMentorId] = useState(mentors && mentors.length === 1 ? mentors[0]._id : "");
  const [topic, setTopic] = useState("");
  const [when, setWhen] = useState("");
  const [minutes, setMinutes] = useState(45);
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!when) return setError("Choose a date and time");
    setBusy(true);
    try {
      const body: Record<string, unknown> = {
        projectId,
        startsAt: new Date(when).toISOString(),
        durationMinutes: minutes,
        topic: topic.trim(),
      };
      if (mentors) body.mentorId = mentorId;
      if (link.trim()) body.meetingLink = link.trim();
      await api.post("/mentoring/sessions", body);
      setTopic("");
      setWhen("");
      setLink("");
      setNotice("Proposed. The other side will be asked to confirm.");
      onCreated();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-slate-200 p-4">
      <p className="font-semibold">Propose a session</p>
      {mentors && (
        <select required value={mentorId} onChange={(e) => setMentorId(e.target.value)} className={`${smallInput} w-full`}>
          <option value="">Choose a mentor…</option>
          {mentors.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
        </select>
      )}
      <input required minLength={3} maxLength={120} value={topic} onChange={(e) => setTopic(e.target.value)}
        placeholder="What do you want to cover?" className={`${smallInput} w-full`} />
      <div className="flex flex-wrap gap-2">
        <input type="datetime-local" required value={when} min={toLocalInput(new Date().toISOString())}
          onChange={(e) => setWhen(e.target.value)} className={smallInput} />
        <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className={smallInput}>
          {[30, 45, 60, 90].map((m) => <option key={m} value={m}>{m} minutes</option>)}
        </select>
      </div>
      <input type="url" value={link} onChange={(e) => setLink(e.target.value)}
        placeholder="Meeting link (optional, https://…)" className={`${smallInput} w-full`} />
      <p className="text-xs text-slate-500">Times are in your own timezone.</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-emerald-700">{notice}</p>}
      <button type="submit" disabled={busy}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
        {busy ? "Sending…" : "Propose session"}
      </button>
    </form>
  );
}