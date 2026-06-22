import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  ArrowRightLeft,
  Plus,
  RefreshCw,
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
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";
import type { Account, Loan, Transaction } from "../types";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: string;
  bgColor: string;
}

function KpiCard({ label, value, icon, trend, color, bgColor }: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bgColor}`}
      >
        <div className={color}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 font-medium mb-0.5">{label}</div>
        <div className="text-xl font-bold text-slate-800 truncate">{value}</div>
        {trend && (
          <div className="text-xs text-green-600 font-medium mt-0.5">
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-2.5 text-sm">
      <p className="text-gray-500 mb-1">{label}</p>
      <p className="font-bold text-blue-600">
        {payload[0].value.toLocaleString("fr-FR")} XAF
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [accRes, loanRes] = await Promise.all([
          api.get<Account[]>("/account"),
          api.get<Loan[]>("/loan"),
        ]);
        if (cancelled) return;
        setAccounts(accRes.data);
        setLoans(loanRes.data);

        if (accRes.data.length > 0) {
          const txRes = await api.get<Transaction[]>(
            `/account/${accRes.data[0].accountId}/transactions`,
          );
          if (cancelled) return;
          setRecentTx(txRes.data.slice(0, 5));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [accRes, loanRes] = await Promise.all([
        api.get<Account[]>("/account"),
        api.get<Loan[]>("/loan"),
      ]);
      setAccounts(accRes.data);
      setLoans(loanRes.data);

      if (accRes.data.length > 0) {
        const txRes = await api.get<Transaction[]>(
          `/account/${accRes.data[0].accountId}/transactions`,
        );
        setRecentTx(txRes.data.slice(0, 5));
      }
    } finally {
      setRefreshing(false);
    }
  };

  // KPIs calculés
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const activeLoans = loans.filter((l) => l.status === "Actif");
  const pendingLoans = loans.filter((l) => l.status === "En attente").length;
  const totalLoanDebt = activeLoans.reduce((sum, l) => sum + l.amount, 0);

  // Données graphique
  const chartData = accounts.map((a) => ({
    name: `${a.accountType}\n${a.accountNumber.slice(-4)}`,
    Solde: a.balance,
  }));

  const formatAmount = (n: number) => n.toLocaleString("fr-FR") + " XAF";
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-60 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Chargement du tableau de bord...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-60 flex-1 p-8">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Bonjour, {user?.fullName?.split(" ")[0]}
              </h2>
              <p className="text-sm text-gray-500">
                Voici un résumé de votre activité
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Actualiser
          </button>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <KpiCard
            label="Solde total"
            value={formatAmount(totalBalance)}
            icon={<Wallet className="w-6 h-6" />}
            color="text-blue-600"
            bgColor="bg-blue-100"
            trend="Tous comptes confondus"
          />
          <KpiCard
            label="Comptes actifs"
            value={accounts.length}
            icon={<CreditCard className="w-6 h-6" />}
            color="text-emerald-600"
            bgColor="bg-emerald-100"
            trend={accounts.map((a) => a.accountType).join(" · ")}
          />
          <KpiCard
            label="Prêts actifs"
            value={activeLoans.length}
            icon={<Landmark className="w-6 h-6" />}
            color="text-orange-600"
            bgColor="bg-orange-100"
            trend={
              totalLoanDebt > 0
                ? `${formatAmount(totalLoanDebt)} en cours`
                : "Aucun encours"
            }
          />
          <KpiCard
            label="Demandes en attente"
            value={pendingLoans}
            icon={<TrendingUp className="w-6 h-6" />}
            color="text-purple-600"
            bgColor="bg-purple-100"
            trend={
              pendingLoans > 0 ? "En cours de traitement" : "Aucune demande"
            }
          />
        </div>

        {/* ── Graphique + Comptes ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Graphique soldes */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Soldes par compte
            </h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={48}>
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
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "#f1f5f9", radius: 8 }}
                  />
                  <Bar dataKey="Solde" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                Aucune donnée à afficher
              </div>
            )}
          </div>

          {/* Carte comptes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              Mes comptes
            </h3>
            <div className="flex flex-col gap-3">
              {accounts.map((a) => (
                <div
                  key={a.accountId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-700">
                      {a.accountType}
                    </div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">
                      {a.accountNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-600">
                      {a.balance.toLocaleString("fr-FR")}
                    </div>
                    <div className="text-xs text-gray-400">XAF</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions rapides */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <a
                href="/transactions"
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Virer
              </a>
              <a
                href="/loans"
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Prêt
              </a>
            </div>
          </div>
        </div>

        {/* ── Transactions récentes ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-blue-600" />
              Transactions récentes
            </h3>
            <a
              href="/accounts"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Voir tout →
            </a>
          </div>

          {recentTx.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <ArrowRightLeft className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">Aucune transaction récente</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentTx.map((tx) => (
                <div
                  key={tx.transactionId}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  {/* Icône */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0
                    ${tx.direction === "Crédit" ? "bg-green-100" : "bg-red-100"}`}
                  >
                    {tx.direction === "Crédit" ? (
                      <ArrowDownLeft className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-red-500" />
                    )}
                  </div>

                  {/* Détails */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 truncate">
                      {tx.description ?? tx.transactionType}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {formatDate(tx.transactionDate)}
                    </div>
                  </div>

                  {/* Montant */}
                  <div
                    className={`text-sm font-bold shrink-0
                    ${tx.direction === "Crédit" ? "text-green-600" : "text-red-500"}`}
                  >
                    {tx.direction === "Crédit" ? "+" : "-"}
                    {formatAmount(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
