import type { UserRole } from "../types";

export const Roles = {
  Admin: "Admin" as UserRole,
  Superviseur: "Superviseur" as UserRole,
  GestionnaireComptes: "GestionnaireComptes" as UserRole,
  AgentCredit: "AgentCredit" as UserRole,
  Caissier: "Caissier" as UserRole,
  Auditeur: "Auditeur" as UserRole,
  Client: "Client" as UserRole,
} as const;

// Groupes de rôles
export const StaffRoles: UserRole[] = [
  "Admin",
  "Superviseur",
  "GestionnaireComptes",
  "AgentCredit",
  "Caissier",
  "Auditeur",
];

export const permissions = {
  canViewDashboard: (r: UserRole) => StaffRoles.includes(r),
  canManageClients: (r: UserRole) =>
    ["Admin", "Superviseur", "GestionnaireComptes"].includes(r),
  canManageAccounts: (r: UserRole) =>
    ["Admin", "GestionnaireComptes"].includes(r),
  canViewAccounts: (r: UserRole) =>
    ["Admin", "Superviseur", "GestionnaireComptes"].includes(r),
  canDeposit: (r: UserRole) => ["Admin", "Caissier"].includes(r),
  canViewTransactions: (r: UserRole) =>
    ["Admin", "Superviseur", "Auditeur", "Caissier"].includes(r),
  canManageLoans: (r: UserRole) => ["Admin", "AgentCredit"].includes(r),
  canViewLoans: (r: UserRole) =>
    ["Admin", "Superviseur", "AgentCredit"].includes(r),
  canViewSettings: (r: UserRole) => r === "Admin",
  canAssignRoles: (r: UserRole) => ["Admin", "Superviseur"].includes(r),
  canViewAudit: (r: UserRole) =>
    ["Admin", "Superviseur", "Auditeur"].includes(r),
};

export const roleLabels: Record<UserRole, string> = {
  Admin: "Administrateur",
  Superviseur: "Superviseur",
  GestionnaireComptes: "Gestionnaire de comptes",
  AgentCredit: "Agent de crédit",
  Caissier: "Caissier",
  Auditeur: "Auditeur",
  Client: "Client",
};

export const roleBadgeColors: Record<UserRole, string> = {
  Admin: "bg-red-100 text-red-700",
  Superviseur: "bg-purple-100 text-purple-700",
  GestionnaireComptes: "bg-blue-100 text-blue-700",
  AgentCredit: "bg-orange-100 text-orange-700",
  Caissier: "bg-green-100 text-green-700",
  Auditeur: "bg-gray-100 text-gray-600",
  Client: "bg-slate-100 text-slate-600",
};
