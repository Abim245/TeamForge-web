import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, errorMessage } from "../../api/client";
import { toLocalInput } from "../../format";
import { card, smallInput } from "../../style";

export default function SettingsAdmin() {
  const [deadline, setDeadline] = useState("");
  const [minSize, setMinSize] = useState(1);
  const [maxSize, setMaxSize] = useState(5);
  const [maxTeams, setMaxTeams] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get("/settings")
      .then((r) => {
        const s = r.data.settings;
        setDeadline(toLocalInput(s.submissionDeadline));
        setMinSize(s.minTeamSize);
        setMaxSize(s.maxTeamSize);
        setMaxTeams(s.maxTeamsPerUser);
        setLoaded(true);
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!window.confirm("Changing the deadline notifies every participant. Save?")) return;
    setBusy(true);
    try {
      await api.patch("/settings", {
        submissionDeadline: deadline ? new Date(deadline).toISOString() : null,
        minTeamSize: minSize,
        maxTeamSize: maxSize,
        maxTeamsPerUser: maxTeams,
      });
      setNotice("Settings saved.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (!loaded && !error) return <p className="text-slate-500">Loading…</p>;

  const label = "mb-1.5 block text-sm font-semibold";
  return (
    <form onSubmit={save} className={`${card} max-w-xl space-y-5`}>
      <h2 className="text-lg font-semibold">Competition rules</h2>
      <div>
        <label className={label}>Submission deadline</label>
        <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={`${smallInput} w-full`} />
        <p className="mt-1 text-xs text-slate-500">
          Times are in your browser's timezone. After the deadline everything locks. Leave empty for no deadline.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label}>Min team size</label>
          <input type="number" min={1} max={20} value={minSize} onChange={(e) => setMinSize(Number(e.target.value))} className={`${smallInput} w-full`} />
        </div>
        <div>
          <label className={label}>Max team size</label>
          <input type="number" min={1} max={20} value={maxSize} onChange={(e) => setMaxSize(Number(e.target.value))} className={`${smallInput} w-full`} />
        </div>
        <div>
          <label className={label}>Teams per person</label>
          <input type="number" min={1} max={5} value={maxTeams} onChange={(e) => setMaxTeams(Number(e.target.value))} className={`${smallInput} w-full`} />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-emerald-700">{notice}</p>}
      <button type="submit" disabled={busy}
        className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
        {busy ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}