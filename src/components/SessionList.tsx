import { useState } from "react";
import { api, errorMessage } from "../api/client";
import Badge from "./Badge";
import type { Tone } from "./Badge";
import { formatDate, toLocalInput } from "../format";
import { smallInput } from "../style";
import type { SessionItem, SessionStatus } from "../type";

const STATUS: Record<SessionStatus, { text: string; tone: Tone }> = {
  PROPOSED: { text: "Proposed", tone: "amber" },
  CONFIRMED: { text: "Confirmed", tone: "green" },
  CANCELLED: { text: "Cancelled", tone: "red" },
  COMPLETED: { text: "Completed", tone: "blue" },
};

function SessionCard({ s, onChanged }: { s: SessionItem; onChanged: () => void }) {
  const [rescheduling, setRescheduling] = useState(false);
  const [when, setWhen] = useState("");
  const [link, setLink] = useState(s.meetingLink);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const info = STATUS[s.status];
  const safeLink = s.meetingLink !== "" && /^https?:\/\//i.test(s.meetingLink);
  const btn = "rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60";

  async function act(body: Record<string, unknown>, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setError("");
    setBusy(true);
    try {
      await api.patch(`/mentoring/sessions/${s._id}`, body);
      setRescheduling(false);
      onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{s.topic}</p>
          <p className="text-sm text-slate-500">
            {s.youAre === "MENTOR" ? s.project?.name : `with ${s.mentor?.name ?? "your mentor"}`}
          </p>
        </div>
        <Badge tone={info.tone}>{info.text}</Badge>
      </div>

      <p className="mt-2 text-sm text-slate-700">
        {formatDate(s.startsAt, true)} · {s.durationMinutes} minutes
      </p>
      {s.status === "PROPOSED" && !s.canConfirm && (
        <p className="mt-1 text-xs text-slate-500">
          Waiting for {s.proposedBy === "TEAM" ? "the mentor" : "the team"} to confirm.
        </p>
      )}
      {s.status === "PROPOSED" && s.canConfirm && (
        <p className="mt-1 text-xs text-amber-700">
          {s.proposedBy === "TEAM" ? "The team" : "The mentor"} proposed this time. Confirm it, or suggest another.
        </p>
      )}
      {safeLink && s.status !== "CANCELLED" && (
        <a href={s.meetingLink} target="_blank" rel="noopener noreferrer"
          className="mt-2 inline-block break-all text-sm font-semibold text-brand hover:underline">
          Join the meeting
        </a>
      )}

      {s.canConfirm && s.youAre === "MENTOR" && (
        <input type="url" value={link} onChange={(e) => setLink(e.target.value)}
          placeholder="Meeting link (optional, https://…)" className={`${smallInput} mt-3 w-full`} />
      )}

      {rescheduling && (
        <div className="mt-3 flex flex-wrap gap-2">
          <input type="datetime-local" value={when} min={toLocalInput(new Date().toISOString())}
            onChange={(e) => setWhen(e.target.value)} className={smallInput} />
          <button disabled={busy || !when} onClick={() => act({ action: "reschedule", startsAt: new Date(when).toISOString() })}
            className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
            Propose new time
          </button>
          <button onClick={() => setRescheduling(false)} className="text-sm font-semibold text-slate-600">Cancel</button>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {s.canConfirm && (
          <button disabled={busy} className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            onClick={() => act({ action: "confirm", ...(link.trim() ? { meetingLink: link.trim() } : {}) })}>
            Confirm
          </button>
        )}
        {s.canComplete && (
          <button disabled={busy} className={btn} onClick={() => act({ action: "complete" })}>Mark as completed</button>
        )}
        {s.canChange && !rescheduling && (
          <button disabled={busy} className={btn} onClick={() => setRescheduling(true)}>Reschedule</button>
        )}
        {s.canChange && (
          <button disabled={busy} className={`${btn} text-red-700`} onClick={() => act({ action: "cancel" }, "Cancel this session?")}>
            Cancel session
          </button>
        )}
      </div>
    </li>
  );
}

export default function SessionList({ sessions, onChanged }: { sessions: SessionItem[]; onChanged: () => void }) {
  const open = sessions.filter((s) => s.canChange);
  const closed = sessions.filter((s) => !s.canChange);

  if (sessions.length === 0) return <p className="text-sm text-slate-500">No sessions yet.</p>;
  return (
    <div className="space-y-4">
      {open.length > 0 && (
        <ul className="space-y-3">{open.map((s) => <SessionCard key={s._id} s={s} onChanged={onChanged} />)}</ul>
      )}
      {closed.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Past and cancelled</p>
          <ul className="mt-2 space-y-3">{closed.map((s) => <SessionCard key={s._id} s={s} onChanged={onChanged} />)}</ul>
        </div>
      )}
    </div>
  );
}