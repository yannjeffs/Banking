import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  ArrowRightLeft,
  Landmark,
  LogOut,
  Building2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import NotificationBell from "./NotificationBell";

const links = [
  {
    to: "/dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    label: "Tableau de bord",
  },
  {
    to: "/accounts",
    icon: <CreditCard className="w-4 h-4" />,
    label: "Mes comptes",
  },
  {
    to: "/transactions",
    icon: <ArrowRightLeft className="w-4 h-4" />,
    label: "Virements",
  },
  { to: "/loans", icon: <Landmark className="w-4 h-4" />, label: "Prêts" },
];

export default function Sidebar() {
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
          <div className="text-blue-400 text-xs font-medium">Espace Client</div>
        </div>
      </div>

      {/* User info */}
      <div className="flex items-center gap-3 px-4 py-3 mx-3 mt-4 bg-slate-800 rounded-xl">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0">
          {user?.fullName?.[0] ?? "U"}
        </div>
        <div className="min-w-0">
          <div className="text-white text-xs font-semibold truncate">
            {user?.fullName}
          </div>
          <div className="text-blue-400 text-xs">{user?.role}</div>
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

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 mt-5 flex-1">
        {/* ... liens existants ... */}
      </nav>

      {/* Notifications + Logout */}
      <div className="px-3 pb-5 flex flex-col gap-2">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs text-slate-400 font-medium">Notifications</span>
          <NotificationBell />
        </div>
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
