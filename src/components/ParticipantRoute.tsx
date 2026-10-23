import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AutoContext";
import { homeFor } from "../staffLink";

export default function ParticipantRoute() {
  const { user } = useAuth();
  if (user && user.role !== "PARTICIPANT") return <Navigate to={homeFor(user.role)} replace />;
  return <Outlet />;
}