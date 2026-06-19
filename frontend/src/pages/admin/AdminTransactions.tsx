import { useEffect, useState } from 'react';
import {
  ArrowRightLeft, Filter, ChevronLeft,
  ChevronRight, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../api/axios';
import type { AdminTransaction } from '../../types';

interface PagedResponse {
  total:    number;
  page:     number;
  pageSize: number;
  data:     AdminTransaction[];
}

export default function AdminTransactions() {
  const [txs, setTxs]           = useState<AdminTransaction[]>([]);
  const [total, setTotal]       = useState<number>(0);
  const [page, setPage]         = useState<number>(1);
  const [typeFilter, setType]   = useState<string>('');
  const [loading, setLoading]   = useState<boolean>(true);
  const pageSize                = 15;
  const totalPages              = Math.ceil(total / pageSize);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page:     page.toString(),
          pageSize: pageSize.toString(),
          ...(typeFilter ? { type: typeFilter } : {}),
        });
        const res = await api.get<PagedResponse>(`/admin/transactions?${params}`);
        if (cancelled) return;
        setTxs(res.data.data);
        setTotal(res.data.total);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [page, typeFilter]);

  const fmt = (n: number) => n.toLocaleString('fr-FR');
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

  const typeColor = (type: string) => {
    switch (type) {
      case 'Virement': return 'bg-blue-100 text-blue-700';
      case 'Depot':    return 'bg-green-100 text-green-700';
      case 'Retrait':  return 'bg-red-100 text-red-600';
      default:         return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="ml-60 flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Transactions</h2>
              <p className="text-sm text-gray-500">{total} opération{total > 1 ? 's' : ''} au total</p>
            </div>
          </div>

          {/* Filtre type */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={e => { setType(e.target.value); setPage(1); }}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="Virement">Virements</option>
              <option value="Depot">Dépôts</option>
              <option value="Retrait">Retraits</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">De</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vers</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : txs.map(tx => (
                <tr key={tx.transactionId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center
                        ${tx.transactionType === 'Depot' ? 'bg-green-100' : tx.transactionType === 'Retrait' ? 'bg-red-100' : 'bg-blue-100'}`}>
                        {tx.transactionType === 'Depot'
                          ? <ArrowDownLeft className="w-3.5 h-3.5 text-green-600" />
                          : <ArrowUpRight  className="w-3.5 h-3.5 text-red-500" />
                        }
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor(tx.transactionType)}`}>
                        {tx.transactionType}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600 max-w-xs truncate">
                    {tx.description ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-xs font-mono text-gray-500">
                    {tx.fromAccount ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-xs font-mono text-gray-500">
                    {tx.toAccount ?? '—'}
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-800 text-sm">
                    {fmt(tx.amount)} XAF
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {fmtDate(tx.transactionDate)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                      ${tx.status === 'Completee'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Page {page} sur {totalPages} · {total} résultats
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}