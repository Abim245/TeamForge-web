import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AutoContext";
import { homeFor } from "../staffLink";
import Home from "../pages/Home";

export default function RootRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role === "JUDGE" || user?.role === "MENTOR") return <Navigate to={homeFor(user.role)} replace />;
  return <Home />;
}