import { Link, Outlet, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import Logo from "./Logo";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../context/AutoContext";
import { homeFor } from "../staffLink";

export default function PublicLayout() {
  const { user, logout } = useAuth();
  const { pathname, search } = useLocation();
  const scope = new URLSearchParams(search).get("scope") ?? "showcase";
  const onHome = pathname === "/";
  const staff = !!user && user.role !== "PARTICIPANT";
  const participant = !!user && !staff;

  const items = [
    { label: "Showcase", to: "/", active: onHome && scope !== "recruiting" && scope !== "mine" },
    { label: "Find a team", to: "/?scope=recruiting", active: onHome && scope === "recruiting" },
    ...(participant ? [{ label: "My projects", to: "/?scope=mine", active: onHome && scope === "mine" }] : []),
    { label: "Announcements", to: "/announcements", active: pathname === "/announcements" },
    ...(participant ? [{ label: "Requests", to: "/requests", active: false }] : []),
    ...(staff ? [{ label: "Dashboard", to: homeFor(user?.role), active: false }] : []),
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1d1d70] bg-ink">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-14">
          <Link to="/"><Logo light large /></Link>
          <nav aria-label="Main" className="flex flex-wrap items-center gap-x-7 gap-y-3">
            {items.map((i) => (
              <Link key={i.label} to={i.to}
                className={`text-[15px] ${i.active ? "font-medium text-white" : "text-indigo-200 hover:text-white"}`}>
                {i.label}
              </Link>
            ))}
            {user ? (
              <>
                <NotificationBell tone="dark" />
                <span className="flex items-center gap-2 text-sm font-medium text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  {user.name}
                </span>
                <button onClick={logout} className="text-sm text-indigo-200 hover:text-white">Sign out</button>
                {participant && (
                  <Link to="/projects/new"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-5 py-2.5 text-[15px] font-semibold text-royal hover:opacity-90">
                    <Plus size={16} /> New project
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="text-[15px] text-indigo-200 hover:text-white">Sign in</Link>
                <Link to="/register" className="rounded-lg bg-gold px-5 py-2.5 text-[15px] font-semibold text-royal hover:opacity-90">
                  Create account
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}