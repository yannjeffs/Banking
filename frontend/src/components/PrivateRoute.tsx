import { StaffRoles } from "../utils/permissions";
import type { UserRole } from "../types";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  // Tout rôle staff est redirigé vers le panel admin
  if (StaffRoles.includes(user.role as UserRole))
    return <Navigate to="/admin/dashboard" />;
  return <>{children}</>;
}
