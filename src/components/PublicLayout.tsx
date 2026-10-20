import { Link, Outlet } from "react-router-dom";
import { Plus } from "lucide-react";
import Logo from "./Logo";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../context/AutoContext";
import { primaryBtn } from "../style";

const link = "text-sm font-medium text-slate-500 hover:text-slate-900";

export default function PublicLayout() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-2">
          <Link to="/"><Logo /></Link>
          <nav className="flex flex-wrap items-center gap-4">
            <Link to="/" className={link}>Explore projects</Link>
            <Link to="/announcements" className={link}>Announcements</Link>
            {user ? (
              <>
                <Link to="/requests" className={link}>Requests</Link>
                {user.role === "ADMIN" && <Link to="/admin" className={link}>Admin</Link>}
                {user.role === "JUDGE" && <Link to="/judging" className={link}>Judging</Link>}
                <NotificationBell />
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  {user.name}
                </span>
                <Link to="/projects/new" className={`${primaryBtn} !px-4 !py-2 text-sm`}>
                  <Plus size={16} /> New project
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900">Sign in</Link>
                <Link to="/register" className={`${primaryBtn} !px-4 !py-2 text-sm`}>Create account</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}