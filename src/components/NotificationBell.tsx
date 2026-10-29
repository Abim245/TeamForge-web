import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AutoContext";

export default function NotificationBell({ to = "/notifications", tone = "light" }: { to?: string; tone?: "light" | "dark" }) {  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const load = () =>
      api.get("/notifications").then((r) => active && setUnread(r.data.unread)).catch(() => {});
    load();
    const timer = setInterval(load, 60000);
    window.addEventListener("notifications-changed", load);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("notifications-changed", load);
    };
  }, [user]);

  if (!user) return null;
  return (
    <Link to={to} aria-label={`Notifications, ${unread} unread`}
      className={`relative rounded-lg p-2 ${tone === "dark" ? "text-slate-300 hover:bg-slate-600" : "text-slate-600 hover:bg-slate-50"}`}>
      <Bell size={20} />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}