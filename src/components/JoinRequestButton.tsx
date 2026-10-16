import { useState } from "react";
import { api, errorMessage } from "../api/client";

export default function JoinRequestButton({ projectId }: { projectId: string }) {
  const [state, setState] = useState<"idle" | "open" | "sent">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    setError("");
    setBusy(true);
    try {
      await api.post(`/projects/${projectId}/join-requests`, { message: message.trim() });
      setState("sent");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (state === "sent") return <p className="text-sm font-semibold text-emerald-700">Request sent. The team lead will respond.</p>;

  if (state === "idle") {
    return (
      <button onClick={() => setState("open")}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
        Request to join
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={300} rows={2}
        placeholder="Optional note to the team lead"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button onClick={send} disabled={busy}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
          {busy ? "Sending…" : "Send request"}
        </button>
        <button onClick={() => setState("idle")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">
          Cancel
        </button>
      </div>
    </div>
  );
}