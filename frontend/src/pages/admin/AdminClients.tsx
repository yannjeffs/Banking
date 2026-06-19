import { useEffect, useState } from "react";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  ShieldCheck,
  ChevronRight,
  Mail,
  Phone,
  CreditCard,
  Wallet,
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import api from "../../api/axios";
import type { AdminUser } from "../../types";

export default function AdminClients() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [actionId, setActionId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get<AdminUser[]>("/admin/users");
        if (cancelled) return;
        setUsers(res.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get<AdminUser[]>("/admin/users");
        if (cancelled) return;
        setUsers(res.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Calculé directement au rendu — pas de useState ni useEffect nécessaires
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone ?? "").includes(q)
    );
  });

  const toggleUser = async (userId: number) => {
    setActionId(userId);
    try {
      const res = await api.put<{ isActive: boolean }>(
        `/admin/users/${userId}/toggle`,
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === userId ? { ...u, isActive: res.data.isActive } : u,
        ),
      );
    } finally {
      setActionId(null);
    }
  };

  const promoteUser = async (userId: number) => {
    setActionId(userId);
    try {
      await api.put(`/admin/users/${userId}/promote`);
      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, role: "Admin" } : u)),
      );
    } finally {
      setActionId(null);
    }
  };

  const fmt = (n: number) => n.toLocaleString("fr-FR");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="ml-60 flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Gestion Clients
              </h2>
              <p className="text-sm text-gray-500">
                {users.length} utilisateur{users.length > 1 ? "s" : ""}{" "}
                enregistré{users.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-60">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Comptes
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Solde total
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((user) => (
                  <tr
                    key={user.userId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Client */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {user.fullName[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-700 text-sm">
                            {user.fullName}
                          </div>
                          <div className="text-xs text-gray-400">
                            Inscrit le{" "}
                            {new Date(user.createdAt).toLocaleDateString(
                              "fr-FR",
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Mail className="w-3 h-3 text-gray-400" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Comptes */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-700">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        {user.accountCount} compte
                        {user.accountCount > 1 ? "s" : ""}
                      </div>
                    </td>

                    {/* Solde */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                        <Wallet className="w-4 h-4" />
                        {fmt(user.totalBalance)} XAF
                      </div>
                    </td>

                    {/* Statut */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border
                        ${
                          user.isActive
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-600 border-red-200"
                        }`}
                      >
                        {user.isActive ? (
                          <>
                            <UserCheck className="w-3 h-3" /> Actif
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3" /> Inactif
                          </>
                        )}
                      </span>
                    </td>

                    {/* Rôle */}
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full
                        ${
                          user.role === "Admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleUser(user.userId)}
                          disabled={actionId === user.userId}
                          title={user.isActive ? "Désactiver" : "Activer"}
                          className={`p-1.5 rounded-lg transition-colors
                            ${
                              user.isActive
                                ? "bg-red-50 text-red-500 hover:bg-red-100"
                                : "bg-green-50 text-green-600 hover:bg-green-100"
                            }`}
                        >
                          {user.isActive ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                        {user.role !== "Admin" && (
                          <button
                            onClick={() => promoteUser(user.userId)}
                            disabled={actionId === user.userId}
                            title="Promouvoir Admin"
                            className="p-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-1.5 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <Users className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">Aucun client trouvé</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
