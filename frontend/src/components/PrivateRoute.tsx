import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  // Un Admin ne doit jamais voir les pages Client
  if (user.role === "Admin") return <Navigate to="/admin/dashboard" />;

  return <>{children}</>;
}
