import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, errorMessage } from "../../api/client";
import Badge from "../../components/Badge";
import { formatDate } from "../../format";
import { card, smallInput } from "../../style";
import type { AnnouncementItem } from "../../type";

export default function AnnouncementsAdmin() {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<AnnouncementItem["kind"]>("ANNOUNCEMENT");
  const [eventDate, setEventDate] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.get("/announcements").then((r) => setItems(r.data.announcements)).catch((e) => setError(errorMessage(e)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function post(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (kind !== "ANNOUNCEMENT" && !eventDate) return setError("Choose a date for deadlines and presentations");
    if (!window.confirm("This notifies every participant. Post it?")) return;
    setBusy(true);
    try {
      await api.post("/admin/announcements", {
        title: title.trim(),
        body: body.trim(),
        kind,
        eventDate: eventDate ? new Date(eventDate).toISOString() : undefined,
      });
      setTitle("");
      setBody("");
      setEventDate("");
      setNotice("Posted. Everyone has been notified.");
      load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await api.delete(`/admin/announcements/${id}`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={post} className={`${card} space-y-4`}>
        <h2 className="text-lg font-semibold">New announcement</h2>
        <div className="flex flex-wrap gap-3">
          <select value={kind} onChange={(e) => setKind(e.target.value as AnnouncementItem["kind"])} className={smallInput}>
            <option value="ANNOUNCEMENT">Announcement</option>
            <option value="DEADLINE">Deadline</option>
            <option value="PRESENTATION">Presentation</option>
          </select>
          {kind !== "ANNOUNCEMENT" && (
            <input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={smallInput} />
          )}
        </div>
        <input required minLength={3} maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Title" className={`${smallInput} w-full`} />
        <textarea rows={4} maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)}
          placeholder="Details (optional)" className={`${smallInput} w-full`} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {notice && <p className="text-sm text-emerald-700">{notice}</p>}
        <button type="submit" disabled={busy}
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
          {busy ? "Posting…" : "Post and notify everyone"}
        </button>
      </form>

      <ul className="space-y-3">
        {items.map((a) => (
          <li key={a._id} className={card}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge tone={a.kind === "DEADLINE" ? "red" : a.kind === "PRESENTATION" ? "blue" : "gray"}>{a.kind.toLowerCase()}</Badge>
                <p className="font-semibold">{a.title}</p>
              </div>
              <button onClick={() => remove(a._id)} className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Posted {formatDate(a.createdAt, true)}{a.eventDate ? ` · event ${formatDate(a.eventDate, true)}` : ""}
            </p>
            {a.body && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{a.body}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}