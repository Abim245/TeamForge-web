import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell, ExternalLink, FolderOpen, Gavel, GraduationCap, LayoutDashboard, LogOut, Megaphone, Settings, Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Logo from "./Logo";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../context/AutoContext";

type StaffRole = "ADMIN" | "JUDGE" | "MENTOR";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  main?: boolean; // the role's home page, which also covers its sub-pages
}

interface Config {
  eyebrow: string;
  roleLabel: string;
  base: string;
  publicLink: boolean;
  nav: NavItem[];
}

const CONFIG: Record<StaffRole, Config> = {
  ADMIN: {
    eyebrow: "DASHBOARD",
    roleLabel: "Administrator",
    base: "/admin",
    publicLink: true,
    nav: [
      { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/admin/participants", label: "Participants", icon: Users },
      { to: "/admin/projects", label: "Projects", icon: FolderOpen },
      { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
      { to: "/admin/judging", label: "Judges", icon: Gavel },
      { to: "/admin/mentoring", label: "Mentors", icon: GraduationCap },
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
  JUDGE: {
    eyebrow: "JUDGE AREA",
    roleLabel: "Judge",
    base: "/judging",
    publicLink: false,
    nav: [
      { to: "/judging", label: "Judging", icon: Gavel, main: true },
      { to: "/judging/announcements", label: "Announcements", icon: Megaphone },
      { to: "/judging/notifications", label: "Notifications", icon: Bell },
    ],
  },
  MENTOR: {
    eyebrow: "MENTOR AREA",
    roleLabel: "Mentor",
    base: "/mentoring",
    publicLink: false,
    nav: [
      { to: "/mentoring", label: "Mentoring", icon: GraduationCap, main: true },
      { to: "/mentoring/announcements", label: "Announcements", icon: Megaphone },
      { to: "/mentoring/notifications", label: "Notifications", icon: Bell },
    ],
  },
};

const SECONDARY = ["/announcements", "/notifications"];

function titleFor(cfg: Config, pathname: string) {
  if (pathname.startsWith(`${cfg.base}/notifications`)) return "Notifications";
  const hit = cfg.nav.find((n) => !n.end && !n.main && pathname.startsWith(n.to));
  return hit ? hit.label : cfg.nav[0].label;
}

const linkClass = (active: boolean) =>
  `flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-3 text-sm font-medium ${
    active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
  }`;

export default function DashboardShell({ role }: { role: StaffRole }) {
  const cfg = CONFIG[role];
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onSecondary = SECONDARY.some((s) => pathname.startsWith(cfg.base + s));

  function signOut() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex w-full flex-col bg-navy p-4 md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0">
        <div className="px-2 py-2"><Logo light /></div>

        <nav className="mt-6 flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {cfg.nav.map(({ to, label, icon: Icon, end, main }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => linkClass(main ? isActive && !onSecondary : isActive)}>
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
              <p className="text-xs text-slate-400">{cfg.roleLabel}</p>
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
            <p className="text-xs font-semibold tracking-widest text-brand">{cfg.eyebrow}</p>
            <h1 className="text-2xl font-normal tracking-tight">{titleFor(cfg, pathname)}</h1>
          </div>
          <div className="flex items-center gap-2">
            {cfg.publicLink && (
              <Link to="/" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:inline-flex">
                <ExternalLink size={16} /> View public site
              </Link>
            )}
            <NotificationBell to={`${cfg.base}/notifications`} />
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