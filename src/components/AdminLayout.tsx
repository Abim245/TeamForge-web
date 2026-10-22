import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/participants", label: "Participants" },
  { to: "/admin/projects", label: "Projects" },
  { to: "/admin/announcements", label: "Announcements" },
  { to: "/admin/judging", label: "Judging" },
    { to: "/admin/mentoring", label: "Mentoring" },
  { to: "/admin/settings", label: "Settings" },
];

export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-semibold tracking-widest text-brand">ADMIN</p>
      <h1 className="mt-1 text-4xl font-normal tracking-tight">Dashboard</h1>
      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end}
            className={({ isActive }) =>
              `whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold ${
                isActive ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}>
            {t.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-6"><Outlet /></div>
    </div>
  );
}