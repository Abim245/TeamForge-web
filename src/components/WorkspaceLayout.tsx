import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, FolderPlus, Home, Inbox, LogOut, Megaphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Logo from "./Logo";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../context/AutoContext";
import { TRACK_LABELS } from "../type";

const NAV: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: "/", label: "Project gallery", icon: Home, end: true },
  { to: "/projects/new", label: "Create project", icon: FolderPlus },
  { to: "/requests", label: "Requests", icon: Inbox },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
];

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-3 text-sm font-medium ${
    isActive ? "bg-blue-50 text-brand" : "text-slate-600 hover:bg-slate-50"
  }`;

function Links() {
  return (
    <>
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={navClass}>
          <Icon size={18} /> {label}
        </NavLink>
      ))}
    </>
  );
}

export default function WorkspaceLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function signOut() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* phones: top bar with sign out, then a scrolling menu */}
      <header className="border-b border-slate-200 bg-white md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold">
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3"><Links /></nav>
      </header>

      {/* larger screens: sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:sticky md:top-0 md:flex md:h-screen">
        <div className="px-2 py-2"><Logo /></div>
        <p className="mt-6 px-3 text-xs font-semibold tracking-widest text-slate-500">WORKSPACE</p>
        <nav className="mt-3 flex flex-col gap-1"><Links /></nav>

        <div className="mt-auto border-t border-slate-200 pt-4">
          <div className="flex items-center gap-3 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
              {user?.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-slate-500">{user ? TRACK_LABELS[user.track] : ""}</p>
            </div>
          </div>
          <button onClick={signOut} className="mt-4 flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 md:px-12 md:py-8"><Outlet /></main>
    </div>
  );
}