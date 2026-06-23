import { useEffect, useState } from 'react';
import {
  ShieldCheck, Search, ChevronDown,
  CheckCircle2, AlertCircle, UserCog
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import type { StaffUser, UserRole } from '../../types';
import {
  roleLabels, roleBadgeColors, permissions, StaffRoles
} from '../../utils/permissions';

const assignableRoles: UserRole[] = [
  'Admin', 'Superviseur', 'GestionnaireComptes',
  'AgentCredit', 'Caissier', 'Auditeur', 'Client'
];

export default function AdminStaff() {
  const { user: currentUser }   = useAuth();
  const [staff, setStaff]       = useState<StaffUser[]>([]);
  const [search, setSearch]     = useState<string>('');
  const [loading, setLoading]   = useState<boolean>(true);
  const [assigning, setAssigning] = useState<number | null>(null);
  const [success, setSuccess]   = useState<string>('');
  const [error, setError]       = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get<StaffUser[]>('/admin/staff');
        if (cancelled) return;
        setStaff(res.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = staff.filter(s => {
    const q = search.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)    ||
      s.role.toLowerCase().includes(q)
    );
  });

  const handleAssignRole = async (userId: number, newRole: UserRole) => {
    setAssigning(userId);
    setError('');
    setSuccess('');
    try {
      await api.put(`/admin/users/${userId}/assign-role`, { role: newRole });
      setStaff(prev =>
        prev.map(s => s.userId === userId ? { ...s, role: newRole } : s)
      );
      const member = staff.find(s => s.userId === userId);
      setSuccess(`Rôle de ${member?.fullName} mis à jour : ${roleLabels[newRole]}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(message || 'Erreur lors de la mise à jour du rôle.');
    } finally {
      setAssigning(null);
    }
  };

  // Un Superviseur ne peut pas assigner le rôle Admin
  const getAssignableRoles = (currentUserRole: UserRole): UserRole[] => {
    if (currentUserRole === 'Superviseur')
      return assignableRoles.filter(r => r !== 'Admin');
    return assignableRoles;
  };

  const currentRole = (currentUser?.role ?? 'Client') as UserRole;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="ml-60 flex-1 p-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Équipe & Rôles</h2>
            <p className="text-sm text-gray-500">
              Gérez les membres du personnel et leurs permissions
            </p>
          </div>
        </div>

        {/* Alertes */}
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Badges résumé des rôles */}
        <div className="flex flex-wrap gap-2 mb-6">
          {StaffRoles.map(role => {
            const count = staff.filter(s => s.role === role).length;
            return (
              <div key={role}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border
                  ${roleBadgeColors[role]} border-current border-opacity-20`}>
                <span>{roleLabels[role]}</span>
                <span className="font-bold">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Recherche */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou rôle..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Membre
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rôle actuel
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  {permissions.canAssignRoles(currentRole) && (
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Changer le rôle
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(member => (
                  <tr key={member.userId} className="hover:bg-gray-50 transition-colors">

                    {/* Membre */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 bg-blue-600">
                          {member.fullName[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-700 text-sm">
                            {member.fullName}
                          </div>
                          <div className="text-xs text-gray-400">
                            Depuis {new Date(member.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {member.email}
                    </td>

                    {/* Rôle actuel */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full
                        ${roleBadgeColors[member.role]}`}>
                        <UserCog className="w-3 h-3" />
                        {roleLabels[member.role]}
                      </span>
                    </td>

                    {/* Statut */}
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                        ${member.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                        }`}>
                        {member.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>

                    {/* Sélecteur de rôle */}
                    {permissions.canAssignRoles(currentRole) && (
                      <td className="px-5 py-4">
                        {member.userId === currentUser?.userId ? (
                          <span className="text-xs text-gray-400 italic">Vous-même</span>
                        ) : (
                          <div className="relative w-52">
                            <select
                              value={member.role}
                              onChange={e =>
                                handleAssignRole(member.userId, e.target.value as UserRole)
                              }
                              disabled={assigning === member.userId}
                              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 pr-8 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                              {getAssignableRoles(currentRole).map(role => (
                                <option key={role} value={role}>
                                  {roleLabels[role]}
                                </option>
                              ))}
                            </select>
                            {assigning === member.userId ? (
                              <div className="absolute right-2.5 top-2.5 w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <ShieldCheck className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">Aucun membre trouvé</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}