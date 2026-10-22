import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, FolderPlus, Gavel, GraduationCap, Home, Inbox, LogOut, Megaphone, ShieldCheck } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../context/AutoContext";
import { TRACK_LABELS } from "../type";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-3 text-sm font-medium ${
    isActive ? "bg-blue-50 text-brand" : "text-slate-600 hover:bg-slate-50"
  }`;

export default function WorkspaceLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function signOut() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex w-full flex-col border-b border-slate-200 bg-white p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="px-2 py-2"><Logo /></div>
        <p className="mt-6 px-3 text-xs font-semibold tracking-widest text-slate-500">WORKSPACE</p>
        <nav className="mt-3 flex gap-1 overflow-x-auto md:flex-col">
          <NavLink to="/" end className={navClass}><Home size={18} /> Project gallery</NavLink>
          <NavLink to="/projects/new" className={navClass}><FolderPlus size={18} /> Create project</NavLink>
          <NavLink to="/requests" className={navClass}><Inbox size={18} /> Requests</NavLink>
          <NavLink to="/notifications" className={navClass}><Bell size={18} /> Notifications</NavLink>
          <NavLink to="/announcements" className={navClass}><Megaphone size={18} /> Announcements</NavLink>
          {user?.role === "ADMIN" && (
            <NavLink to="/admin" className={navClass}><ShieldCheck size={18} /> Admin</NavLink>
          )}
          {user?.role === "JUDGE" && (
            <NavLink to="/judging" className={navClass}><Gavel size={18} /> Judging</NavLink>
          )}
                    
            {user?.role === "MENTOR" && (
            <NavLink to="/mentoring" className={navClass}><GraduationCap size={18} /> Mentoring</NavLink>
          )}
        </nav>

        <div className="mt-auto hidden border-t border-slate-200 pt-4 md:block">
          <div className="flex items-center gap-3 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
              {user?.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-slate-500">{user ? TRACK_LABELS[user.track] : ""}</p>
            </div>
          </div>
          <button onClick={signOut} className="mt-4 flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 px-6 py-8 md:px-12"><Outlet /></main>
    </div>
  );
}