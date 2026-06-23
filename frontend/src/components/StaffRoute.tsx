import { Navigate } from "react-router-dom";
import { StaffRoles } from "../utils/permissions";
import type { UserRole } from "../types";
import { useAuth } from "../hooks/useAuth";

export default function StaffRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!StaffRoles.includes(user.role as UserRole)) return <Navigate to="/dashboard" />;
  return <>{children}</>;
}