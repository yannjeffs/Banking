import { useEffect, useState } from 'react';
import {
  CreditCard, Search, Plus, ToggleLeft,
  ToggleRight, ChevronDown, X, CheckCircle2
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../api/axios';
import type { AdminAccount, AdminUser } from '../../types';

interface CreateForm {
  userId:      number | '';
  accountType: string;
  currency:    string;
}

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [filtered, setFiltered] = useState<AdminAccount[]>([]);
  const [users, setUsers]       = useState<AdminUser[]>([]);
  const [search, setSearch]     = useState<string>('');
  const [loading, setLoading]   = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [success, setSuccess]   = useState<string>('');
  const [error, setError]       = useState<string>('');
  const [form, setForm]         = useState<CreateForm>({
    userId: '', accountType: 'Courant', currency: 'XAF'
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [accRes, usersRes] = await Promise.all([
          api.get<AdminAccount[]>('/admin/accounts'),
          api.get<AdminUser[]>('/admin/users'),
        ]);
        if (cancelled) return;
        setAccounts(accRes.data);
        setFiltered(accRes.data);
        setUsers(usersRes.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      accounts.filter(a =>
        a.accountNumber.toLowerCase().includes(q) ||
        a.ownerName.toLowerCase().includes(q)     ||
        a.ownerEmail.toLowerCase().includes(q)    ||
        a.accountType.toLowerCase().includes(q)
      )
    );
  }, [search, accounts]);

  const toggleAccount = async (accountId: number) => {
    const res = await api.put<{ isActive: boolean }>(
      `/admin/accounts/${accountId}/toggle`
    );
    setAccounts(prev =>
      prev.map(a =>
        a.accountId === accountId ? { ...a, isActive: res.data.isActive } : a
      )
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post<{ accountNumber: string }>(
        '/admin/accounts', form
      );
      setSuccess(`Compte ${res.data.accountNumber} créé avec succès !`);
      setShowForm(false);
      const accRes = await api.get<AdminAccount[]>('/admin/accounts');
      setAccounts(accRes.data);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(message || 'Erreur lors de la création.');
    }
  };

  const fmt = (n: number) => n.toLocaleString('fr-FR');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="ml-60 flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Gestion Comptes</h2>
              <p className="text-sm text-gray-500">{accounts.length} compte{accounts.length > 1 ? 's' : ''} au total</p>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(f => !f); setError(''); setSuccess(''); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
              ${showForm
                ? 'bg-gray-100 text-gray-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {showForm ? <><X className="w-4 h-4" /> Annuler</> : <><Plus className="w-4 h-4" /> Nouveau compte</>}
          </button>
        </div>

        {/* Alertes */}
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}

        {/* Formulaire création */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Créer un compte bancaire
            </h3>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Client</label>
                <div className="relative">
                  <select
                    value={form.userId}
                    onChange={e => setForm(f => ({ ...f, userId: Number(e.target.value) }))}
                    required
                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un client</option>
                    {users.map(u => (
                      <option key={u.userId} value={u.userId}>{u.fullName}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Type de compte</label>
                <div className="relative">
                  <select
                    value={form.accountType}
                    onChange={e => setForm(f => ({ ...f, accountType: e.target.value }))}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Courant">Courant</option>
                    <option value="Epargne">Épargne</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                >
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recherche */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par numéro, propriétaire, type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center h-40 items-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Numéro</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Propriétaire</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Solde</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ouvert le</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(acc => (
                  <tr key={acc.accountId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-sm text-slate-700">{acc.accountNumber}</td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-slate-700">{acc.ownerName}</div>
                      <div className="text-xs text-gray-400">{acc.ownerEmail}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                        ${acc.accountType === 'Courant'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                        }`}>
                        {acc.accountType}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-emerald-600 text-sm">
                      {fmt(acc.balance)} {acc.currency}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {new Date(acc.openedAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                        ${acc.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                        }`}>
                        {acc.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => toggleAccount(acc.accountId)}
                        title={acc.isActive ? 'Désactiver' : 'Activer'}
                        className={`p-1.5 rounded-lg transition-colors
                          ${acc.isActive
                            ? 'bg-red-50 text-red-500 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                      >
                        {acc.isActive
                          ? <ToggleRight className="w-5 h-5" />
                          : <ToggleLeft  className="w-5 h-5" />
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <CreditCard className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">Aucun compte trouvé</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}