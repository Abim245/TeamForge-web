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

  if (state === "sent") return <p className="text-sm font-semibold text-emerald-300">Request sent. The team lead will respond.</p>;

  if (state === "idle") {
    return (
      <button onClick={() => setState("open")}
        className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-royal hover:opacity-90">
        Request to join
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={300} rows={2}
        placeholder="Optional note to the team lead"
        className="w-full rounded-lg border border-[#3b3d9e] bg-ink px-3 py-2 text-sm text-white outline-none placeholder:text-indigo-300 focus:border-gold" />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="flex gap-2">
        <button onClick={send} disabled={busy}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-royal hover:opacity-90 disabled:opacity-60">
          {busy ? "Sending…" : "Send request"}
        </button>
        <button onClick={() => setState("idle")}
          className="rounded-lg border border-[#3b3d9e] px-4 py-2 text-sm font-semibold text-indigo-100 hover:bg-white/5">
          Cancel
        </button>
      </div>
    </div>
  );
}