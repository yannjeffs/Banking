import { useEffect, useState } from 'react';
import {
  Landmark, CheckCircle2, XCircle, Clock,
  TrendingUp, Calendar, Wallet, Filter
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../api/axios';
import type { AdminLoan } from '../../types';

const statusConfig: Record<string, { label: string; classes: string }> = {
  'En attente': { label: 'En attente', classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  'Actif':      { label: 'Actif',      classes: 'bg-green-50 text-green-700 border-green-200'   },
  'Rembourse':  { label: 'Remboursé',  classes: 'bg-blue-50 text-blue-700 border-blue-200'      },
  'Rejete':     { label: 'Rejeté',     classes: 'bg-red-50 text-red-600 border-red-200'         },
  'Approuve':   { label: 'Approuvé',   classes: 'bg-teal-50 text-teal-700 border-teal-200'      },
};

export default function AdminLoans() {
  const [loans, setLoans]         = useState<AdminLoan[]>([]);
  const [filtered, setFiltered]   = useState<AdminLoan[]>([]);
  const [statusFilter, setStatus] = useState<string>('all');
  const [loading, setLoading]     = useState<boolean>(true);
  const [actionId, setActionId]   = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get<AdminLoan[]>('/admin/loans');
        if (cancelled) return;
        setLoans(res.data);
        setFiltered(res.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setFiltered(
      statusFilter === 'all'
        ? loans
        : loans.filter(l => l.status === statusFilter)
    );
  }, [statusFilter, loans]);

  const approveLoan = async (loanId: number) => {
    setActionId(loanId);
    try {
      await api.put(`/loan/${loanId}/approve`);
      setLoans(prev =>
        prev.map(l => l.loanId === loanId ? { ...l, status: 'Actif' } : l)
      );
    } finally {
      setActionId(null);
    }
  };

  const rejectLoan = async (loanId: number) => {
    setActionId(loanId);
    try {
      await api.put(`/loan/${loanId}/reject`, { reason: 'Rejeté par admin' });
      setLoans(prev =>
        prev.map(l => l.loanId === loanId ? { ...l, status: 'Rejete' } : l)
      );
    } finally {
      setActionId(null);
    }
  };

  const fmt = (n: number) => n.toLocaleString('fr-FR');
  const pending = loans.filter(l => l.status === 'En attente').length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="ml-60 flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Landmark className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Gestion Prêts</h2>
              <p className="text-sm text-gray-500">
                {loans.length} prêt{loans.length > 1 ? 's' : ''} · {pending} en attente
              </p>
            </div>
          </div>

          {/* Filtre statut */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={e => setStatus(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="En attente">En attente</option>
              <option value="Actif">Actifs</option>
              <option value="Rembourse">Remboursés</option>
              <option value="Rejete">Rejetés</option>
            </select>
          </div>
        </div>

        {/* Alerte prêts en attente */}
        {pending > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 mb-6">
            <Clock className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700 font-medium">
              {pending} demande{pending > 1 ? 's' : ''} en attente de traitement
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(loan => {
              const cfg       = statusConfig[loan.status] ?? statusConfig['En attente'];
              const isPending = loan.status === 'En attente';
              const isLoading = actionId === loan.loanId;

              return (
                <div key={loan.loanId}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex flex-wrap items-start gap-4">

                    {/* Icône */}
                    <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <Landmark className="w-5 h-5 text-blue-600" />
                    </div>

                    {/* Infos principales */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-slate-800">
                          {fmt(loan.amount)} XAF
                        </span>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${cfg.classes}`}>
                          {loan.status === 'En attente' && <Clock         className="w-3 h-3" />}
                          {loan.status === 'Actif'      && <CheckCircle2  className="w-3 h-3" />}
                          {loan.status === 'Rejete'     && <XCircle       className="w-3 h-3" />}
                          {cfg.label}
                        </span>
                      </div>

                      <div className="text-sm font-medium text-blue-600 mb-2">
                        {loan.ownerName}
                        <span className="text-gray-400 font-normal ml-2">{loan.ownerEmail}</span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {loan.interestRate}% / an
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {loan.termMonths} mois
                        </span>
                        <span className="flex items-center gap-1">
                          <Wallet className="w-3.5 h-3.5" />
                          {fmt(loan.monthlyPayment)} XAF/mois
                        </span>
                        <span className="text-gray-400">
                          Compte : {loan.accountNumber}
                        </span>
                        <span className="text-gray-400">
                          Demande : {new Date(loan.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {isPending && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => approveLoan(loan.loanId)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-medium rounded-xl transition-colors"
                        >
                          {isLoading
                            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <CheckCircle2 className="w-4 h-4" />
                          }
                          Approuver
                        </button>
                        <button
                          onClick={() => rejectLoan(loan.loanId)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-xl border border-red-200 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Rejeter
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 bg-white rounded-2xl border border-gray-100 text-gray-400">
                <Landmark className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">Aucun prêt pour ce filtre</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}