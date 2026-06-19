import { useEffect, useState } from 'react';
import {
  PiggyBank, ArrowDownCircle, ArrowUpCircle,
  Search, CheckCircle2, AlertCircle, Wallet
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../api/axios';
import type { AdminAccount } from '../../types';

interface OpForm {
  accountNumber: string;
  amount:        number | '';
  description:   string;
}

export default function AdminDeposits() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [search, setSearch]     = useState<string>('');
  const [selected, setSelected] = useState<AdminAccount | null>(null);
  const [mode, setMode]         = useState<'deposit' | 'withdraw'>('deposit');
  const [form, setForm]         = useState<OpForm>({
    accountNumber: '', amount: '', description: ''
  });
  const [loading, setLoading]   = useState<boolean>(false);
  const [success, setSuccess]   = useState<string>('');
  const [error, setError]       = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const res = await api.get<AdminAccount[]>('/admin/accounts');
      if (!cancelled) setAccounts(res.data);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredAccounts = accounts.filter(a =>
    a.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
    a.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  const selectAccount = (acc: AdminAccount) => {
    setSelected(acc);
    setForm(f => ({ ...f, accountNumber: acc.accountNumber }));
    setSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const endpoint = mode === 'deposit' ? '/admin/deposit' : '/admin/withdraw';
      const res      = await api.post<{ message: string; newBalance: number }>(
        endpoint, { ...form, amount: Number(form.amount) }
      );
      setSuccess(`${res.data.message} — Nouveau solde : ${res.data.newBalance.toLocaleString('fr-FR')} XAF`);
      setSelected(prev =>
        prev ? { ...prev, balance: res.data.newBalance } : null
      );
      setAccounts(prev =>
        prev.map(a =>
          a.accountNumber === form.accountNumber
            ? { ...a, balance: res.data.newBalance }
            : a
        )
      );
      setForm(f => ({ ...f, amount: '', description: '' }));
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(message || 'Erreur lors de l\'opération.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => n.toLocaleString('fr-FR');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="ml-60 flex-1 p-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <PiggyBank className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Dépôts & Retraits</h2>
            <p className="text-sm text-gray-500">Opérations manuelles sur les comptes</p>
          </div>
        </div>

        <div className="flex gap-6 flex-col xl:flex-row">

          {/* ── Formulaire ── */}
          <div className="flex-1 max-w-xl">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

              {/* Toggle Dépôt / Retrait */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
                <button
                  onClick={() => setMode('deposit')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${mode === 'deposit'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  Dépôt
                </button>
                <button
                  onClick={() => setMode('withdraw')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${mode === 'withdraw'
                      ? 'bg-white text-red-500 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  Retrait
                </button>
              </div>

              {/* Alertes */}
              {error   && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Recherche compte */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Compte cible
                  </label>
                  {selected ? (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                      <div>
                        <div className="text-sm font-semibold text-blue-800 font-mono">
                          {selected.accountNumber}
                        </div>
                        <div className="text-xs text-blue-600 mt-0.5">
                          {selected.ownerName} · {fmt(selected.balance)} XAF
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSelected(null); setForm(f => ({ ...f, accountNumber: '' })); }}
                        className="text-blue-400 hover:text-blue-600 text-xs underline"
                      >
                        Changer
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher un compte ou un client..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {search && filteredAccounts.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                          {filteredAccounts.slice(0, 5).map(acc => (
                            <button
                              key={acc.accountId}
                              type="button"
                              onClick={() => selectAccount(acc)}
                              className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                            >
                              <div>
                                <div className="text-sm font-mono font-medium text-slate-700">
                                  {acc.accountNumber}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {acc.ownerName} · {acc.accountType}
                                </div>
                              </div>
                              <div className="text-sm font-bold text-emerald-600">
                                {fmt(acc.balance)} XAF
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Montant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Montant (XAF)
                  </label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      min="1"
                      placeholder="0"
                      value={form.amount}
                      onChange={e => setForm(f => ({ ...f, amount: e.target.value ? Number(e.target.value) : '' }))}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description <span className="text-gray-400 font-normal">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    placeholder={mode === 'deposit' ? 'Ex: Dépôt initial...' : 'Ex: Retrait guichet...'}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Bouton */}
                <button
                  type="submit"
                  disabled={loading || !selected}
                  className={`flex items-center justify-center gap-2 w-full font-semibold py-3 rounded-xl transition-colors text-sm
                    ${mode === 'deposit'
                      ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white'
                      : 'bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white'
                    }`}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : mode === 'deposit' ? (
                    <><ArrowDownCircle className="w-4 h-4" /> Effectuer le dépôt</>
                  ) : (
                    <><ArrowUpCircle className="w-4 h-4" /> Effectuer le retrait</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ── Panneau comptes récents ── */}
          <div className="xl:w-80">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-slate-800 mb-4 text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-600" />
                Comptes récents
              </h3>
              <div className="flex flex-col gap-2">
                {accounts.slice(0, 8).map(acc => (
                  <button
                    key={acc.accountId}
                    onClick={() => selectAccount(acc)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 transition-colors text-left"
                  >
                    <div>
                      <div className="text-xs font-mono font-medium text-slate-700">
                        {acc.accountNumber}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {acc.ownerName}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-emerald-600">
                      {fmt(acc.balance)} XAF
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}