import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AutoContext";

// Hides the screens from everyone else. The backend refuses non-mentors anyway.
export default function MentorRoute() {
  const { user } = useAuth();
  if (user?.role !== "MENTOR") return <Navigate to="/" replace />;
  return <Outlet />;
}