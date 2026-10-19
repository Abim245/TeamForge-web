import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, errorMessage } from "../api/client";
import { formatDate } from "../format";
import type { NotificationItem } from "../type";

export default function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await api.get("/notifications");
      setItems(r.data.notifications);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changed = () => window.dispatchEvent(new Event("notifications-changed"));

  async function open(n: NotificationItem) {
    if (!n.read) {
      await api.patch(`/notifications/${n._id}/read`).catch(() => {});
      changed();
    }
    if (n.link.startsWith("/") && !n.link.startsWith("//")) navigate(n.link);
    else load();
  }

  async function readAll() {
    await api.post("/notifications/read-all").catch(() => {});
    changed();
    load();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-brand">INBOX</p>
          <h1 className="mt-1 text-4xl font-normal tracking-tight">Notifications</h1>
        </div>
        {items.some((n) => !n.read) && (
          <button onClick={readAll} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
            Mark all as read
          </button>
        )}
      </div>

      {error && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="mt-6 text-slate-500">Loading…</p>}
      {!loading && items.length === 0 && <p className="mt-6 text-slate-500">Nothing here yet.</p>}

      <ul className="mt-6 space-y-2">
        {items.map((n) => (
          <li key={n._id}>
            <button onClick={() => open(n)}
              className={`w-full rounded-xl border p-4 text-left ${
                n.read ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50"
              }`}>
              <p className="flex items-center gap-2 text-sm font-semibold">
                {!n.read && <span className="h-2 w-2 rounded-full bg-brand" />}
                {n.title}
              </p>
              {n.body && <p className="mt-1 text-sm text-slate-600">{n.body}</p>}
              <p className="mt-1 text-xs text-slate-500">{formatDate(n.createdAt, true)}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}