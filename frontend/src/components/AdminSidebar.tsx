import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowRightLeft,
  Landmark,
  LogOut,
  Building2,
  PiggyBank,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const links = [
  {
    to: "/admin/dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    label: "Dashboard",
  },
  {
    to: "/admin/clients",
    icon: <Users className="w-4 h-4" />,
    label: "Clients",
  },
  {
    to: "/admin/accounts",
    icon: <CreditCard className="w-4 h-4" />,
    label: "Comptes",
  },
  {
    to: "/admin/transactions",
    icon: <ArrowRightLeft className="w-4 h-4" />,
    label: "Transactions",
  },
  {
    to: "/admin/loans",
    icon: <Landmark className="w-4 h-4" />,
    label: "Prêts",
  },
  {
    to: "/admin/deposits",
    icon: <PiggyBank className="w-4 h-4" />,
    label: "Dépôts/Retraits",
  },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 w-60 min-h-screen bg-slate-900 flex flex-col z-10">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm">E-Banking</div>
          <div className="text-blue-400 text-xs font-medium">Panel Admin</div>
        </div>
      </div>

      {/* User info */}
      <div className="flex items-center gap-3 px-4 py-3 mx-3 mt-4 bg-slate-800 rounded-xl">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0">
          {user?.fullName?.[0] ?? "A"}
        </div>
        <div className="min-w-0">
          <div className="text-white text-xs font-semibold truncate">
            {user?.fullName}
          </div>
          <div className="text-blue-400 text-xs">Administrateur</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 mt-5 flex-1">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-2 mb-2">
          Navigation
        </p>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
