import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, ArrowRightLeft,
  Landmark, LogOut, Building2, PiggyBank, Settings,
  ShieldCheck, FileText
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { permissions, roleLabels, roleBadgeColors } from '../utils/permissions';
import type { UserRole } from '../types';
import NotificationBell from './NotificationBell';

interface NavLink {
  to:      string;
  icon:    React.ReactNode;
  label:   string;
  show:    boolean;
}

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const role             = (user?.role ?? 'Client') as UserRole;

  const handleLogout = () => { logout(); navigate('/login'); };

  const links: NavLink[] = [
    {
      to:    '/admin/dashboard',
      icon:  <LayoutDashboard className="w-4 h-4" />,
      label: 'Dashboard',
      show:  permissions.canViewDashboard(role),
    },
    {
      to:    '/admin/clients',
      icon:  <Users className="w-4 h-4" />,
      label: 'Clients',
      show:  permissions.canManageClients(role),
    },
    {
      to:    '/admin/accounts',
      icon:  <CreditCard className="w-4 h-4" />,
      label: 'Comptes',
      show:  permissions.canViewAccounts(role),
    },
    {
      to:    '/admin/transactions',
      icon:  <ArrowRightLeft className="w-4 h-4" />,
      label: 'Transactions',
      show:  permissions.canViewTransactions(role),
    },
    {
      to:    '/admin/loans',
      icon:  <Landmark className="w-4 h-4" />,
      label: 'Prêts',
      show:  permissions.canViewLoans(role),
    },
    {
      to:    '/admin/deposits',
      icon:  <PiggyBank className="w-4 h-4" />,
      label: 'Dépôts/Retraits',
      show:  permissions.canDeposit(role),
    },
    {
      to:    '/admin/staff',
      icon:  <ShieldCheck className="w-4 h-4" />,
      label: 'Équipe & Rôles',
      show:  permissions.canAssignRoles(role),
    },
    {
      to:    '/admin/audit',
      icon:  <FileText className="w-4 h-4" />,
      label: 'Audit',
      show:  permissions.canViewAudit(role),
    },
    {
      to:    '/admin/settings',
      icon:  <Settings className="w-4 h-4" />,
      label: 'Paramètres',
      show:  permissions.canViewSettings(role),
    },
  ].filter(l => l.show);

  return (
    <aside className="fixed left-0 top-0 w-60 min-h-screen bg-slate-900 flex flex-col z-10">

      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm">E-Banking</div>
          <div className="text-blue-400 text-xs font-medium">Panel Staff</div>
        </div>
      </div>

      {/* User info + badge rôle */}
      <div className="flex items-center gap-3 px-4 py-3 mx-3 mt-4 bg-slate-800 rounded-xl">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0">
          {user?.fullName?.[0] ?? 'S'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-white text-xs font-semibold truncate">
            {user?.fullName}
          </div>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full mt-0.5 inline-block
            ${roleBadgeColors[role]}`}>
            {roleLabels[role]}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 mt-5 flex-1">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-2 mb-2">
          Navigation
        </p>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
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