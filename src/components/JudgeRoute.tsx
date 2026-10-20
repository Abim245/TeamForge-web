import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AutoContext";

// Hides the screens from everyone else. The backend refuses non-judges anyway.
export default function JudgeRoute() {
  const { user } = useAuth();
  if (user?.role !== "JUDGE") return <Navigate to="/" replace />;
  return <Outlet />;
}