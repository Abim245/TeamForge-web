import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AutoContext";

// This only hides the screens. The backend refuses admin requests from anyone else anyway.
export default function AdminRoute() {
  const { user } = useAuth();
  if (user?.role !== "ADMIN") return <Navigate to="/" replace />;
  return <Outlet />;
}