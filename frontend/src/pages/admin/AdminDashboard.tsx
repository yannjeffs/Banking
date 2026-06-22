import { useEffect, useState } from "react";
import {
  Users,
  CreditCard,
  Landmark,
  ArrowRightLeft,
  TrendingUp,
  Clock,
  Wallet,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import AdminSidebar from "../../components/AdminSidebar";
import api from "../../api/axios";
import type { AdminStats, AdminLoan, AdminTransaction } from "../../types";

interface KpiProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  bg: string;
  iconCol: string;
  sub?: string;
}

function KpiCard({ label, value, icon, bg, iconCol, sub }: KpiProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg}`}
      >
        <div className={iconCol}>{icon}</div>
      </div>
      <div className="min-w-0">
        <div className="text-xs text-gray-500 font-medium">{label}</div>
        <div className="text-xl font-bold text-slate-800 truncate">{value}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loans, setLoans] = useState<AdminLoan[]>([]);
  const [txs, setTxs] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [statsRes, loansRes, txRes] = await Promise.all([
          api.get<AdminStats>("/admin/stats"),
          api.get<AdminLoan[]>("/admin/loans?status=En attente"),
          api.get<{ data: AdminTransaction[] }>(
            "/admin/transactions?pageSize=8",
          ),
        ]);
        if (cancelled) return;
        setStats(statsRes.data);
        setLoans(loansRes.data);
        setTxs(txRes.data.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const [statsRes, loansRes, txRes] = await Promise.all([
        api.get<AdminStats>("/admin/stats"),
        api.get<AdminLoan[]>("/admin/loans?status=En attente"),
        api.get<{ data: AdminTransaction[] }>("/admin/transactions?pageSize=8"),
      ]);
      setStats(statsRes.data);
      setLoans(loansRes.data);
      setTxs(txRes.data.data);
    } finally {
      setRefreshing(false);
    }
  };

  const approveLoan = async (loanId: number) => {
    await api.put(`/loan/${loanId}/approve`);
    setLoans((prev) => prev.filter((l) => l.loanId !== loanId));
    refresh();
  };

  const rejectLoan = async (loanId: number) => {
    await api.put(`/loan/${loanId}/reject`, {
      reason: "Rejeté depuis le dashboard",
    });
    setLoans((prev) => prev.filter((l) => l.loanId !== loanId));
    refresh();
  };

  const fmt = (n: number) => n.toLocaleString("fr-FR");

  // Données graphique transactions par type
  const txChartData = [
    {
      name: "Virements",
      total: txs.filter((t) => t.transactionType === "Virement").length,
    },
    {
      name: "Dépôts",
      total: txs.filter((t) => t.transactionType === "Depot").length,
    },
    {
      name: "Retraits",
      total: txs.filter((t) => t.transactionType === "Retrait").length,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="ml-60 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Chargement du dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="ml-60 flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Tableau de bord Administrateur
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Vue globale de la banque
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Actualiser
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <KpiCard
            label="Clients"
            value={stats?.totalUsers ?? 0}
            icon={<Users className="w-6 h-6" />}
            bg="bg-blue-100"
            iconCol="text-blue-600"
            sub="Comptes clients actifs"
          />
          <KpiCard
            label="Comptes bancaires"
            value={stats?.totalAccounts ?? 0}
            icon={<CreditCard className="w-6 h-6" />}
            bg="bg-emerald-100"
            iconCol="text-emerald-600"
            sub={`${fmt(stats?.totalDeposits ?? 0)} XAF total`}
          />
          <KpiCard
            label="Prêts actifs"
            value={stats?.activeLoans ?? 0}
            icon={<Landmark className="w-6 h-6" />}
            bg="bg-orange-100"
            iconCol="text-orange-600"
            sub={`${fmt(stats?.totalLoanAmount ?? 0)} XAF en cours`}
          />
          <KpiCard
            label="Transactions"
            value={stats?.totalTransactions ?? 0}
            icon={<ArrowRightLeft className="w-6 h-6" />}
            bg="bg-purple-100"
            iconCol="text-purple-600"
            sub="Toutes opérations"
          />
        </div>

        {/* Alertes prêts en attente */}
        {(stats?.pendingLoans ?? 0) > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700 font-medium">
              {stats?.pendingLoans} demande
              {(stats?.pendingLoans ?? 0) > 1 ? "s" : ""} de prêt en attente
              d'approbation
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Graphique */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Activité récente par type
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={txChartData} barSize={40}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                  cursor={{ fill: "#f1f5f9", radius: 8 }}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stats rapides */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Résumé prêts
            </h3>
            <div className="flex flex-col gap-3">
              {[
                {
                  label: "En attente",
                  value: stats?.pendingLoans ?? 0,
                  color: "bg-yellow-500",
                },
                {
                  label: "Actifs",
                  value: stats?.activeLoans ?? 0,
                  color: "bg-green-500",
                },
                {
                  label: "Total",
                  value: stats?.totalLoans ?? 0,
                  color: "bg-blue-500",
                },
                {
                  label: "Encours",
                  value: `${fmt(stats?.totalLoanAmount ?? 0)} XAF`,
                  color: "bg-orange-500",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className="font-bold text-slate-800 text-sm">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Prêts en attente */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Prêts à traiter
              </h3>
              {loans.length > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                  {loans.length} en attente
                </span>
              )}
            </div>
            <div className="divide-y divide-gray-50">
              {loans.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <CheckCircle2 className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">Aucun prêt en attente</p>
                </div>
              ) : (
                loans.map((loan) => (
                  <div
                    key={loan.loanId}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-700 truncate">
                        {loan.ownerName}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {fmt(loan.amount)} XAF · {loan.termMonths} mois ·{" "}
                        {loan.interestRate}%
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => approveLoan(loan.loanId)}
                        className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                        title="Approuver"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => rejectLoan(loan.loanId)}
                        className="p-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition-colors"
                        title="Rejeter"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dernières transactions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-600" />
                Dernières transactions
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {txs.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                  Aucune transaction
                </div>
              ) : (
                txs.map((tx) => (
                  <div
                    key={tx.transactionId}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
                      ${
                        tx.transactionType === "Virement"
                          ? "bg-blue-100 text-blue-600"
                          : tx.transactionType === "Depot"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-500"
                      }`}
                    >
                      {tx.transactionType[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-700 truncate">
                        {tx.description ?? tx.transactionType}
                      </div>
                      <div className="text-xs text-gray-400">
                        {tx.fromAccount ?? "—"} → {tx.toAccount ?? "—"}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-700 shrink-0">
                      {fmt(tx.amount)} XAF
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
