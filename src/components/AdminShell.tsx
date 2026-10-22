import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ExternalLink, FolderOpen, Gavel, GraduationCap, LayoutDashboard, LogOut, Megaphone, Settings, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Logo from "./Logo";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../context/AutoContext";

const NAV: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/participants", label: "Participants", icon: Users },
  { to: "/admin/projects", label: "Projects", icon: FolderOpen },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/judging", label: "Judges", icon: Gavel },
  { to: "/admin/mentoring", label: "Mentors", icon: GraduationCap },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function sectionTitle(pathname: string) {
  if (pathname.startsWith("/admin/notifications")) return "Notifications";
  const hit = NAV.find((n) => !n.end && pathname.startsWith(n.to));
  return hit ? hit.label : "Overview";
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-3 text-sm font-medium ${
    isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
  }`;

export default function AdminShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function signOut() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex w-full flex-col bg-navy p-4 md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0">
        <div className="px-2 py-2"><Logo light /></div>

        <nav className="mt-6 flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto hidden border-t border-white/10 pt-4 md:block">
          <div className="flex items-center gap-3 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white">
              {user?.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
          <button onClick={signOut}
            className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white">
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 bg-slate-50">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4 md:px-10">
          <div>
            <p className="text-xs font-semibold tracking-widest text-brand">DASHBOARD</p>
            <h1 className="text-2xl font-normal tracking-tight">{sectionTitle(pathname)}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:inline-flex">
              <ExternalLink size={16} /> View public site
            </Link>
            <NotificationBell to="/admin/notifications" />
            <button onClick={signOut} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold md:hidden">
              Sign out
            </button>
          </div>
        </header>
        <main className="px-6 py-6 md:px-10">
          <div className="mx-auto max-w-6xl"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}