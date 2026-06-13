import { useEffect, useState } from "react";
import {
  CreditCard,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Inbox,
  RefreshCw,
  BadgeCheck,
  Clock,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import type { Account, Transaction } from "../types";

const statusIcon = (status: string) => {
  switch (status) {
    case "Completee":
      return <BadgeCheck className="w-3.5 h-3.5 text-green-500" />;
    case "En attente":
      return <Clock className="w-3.5 h-3.5 text-yellow-500" />;
    default:
      return <XCircle className="w-3.5 h-3.5 text-red-500" />;
  }
};

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selected, setSelected] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingAcc, setLoadingAcc] = useState<boolean>(true);
  const [loadingTx, setLoadingTx] = useState<boolean>(false);
  const navigate = useNavigate();

  // Chargement initial des comptes
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await api.get<Account[]>("/account");
        if (cancelled) return;
        setAccounts(res.data);

        if (res.data.length > 0) {
          const first = res.data[0];
          setSelected(first);
          const txRes = await api.get<Transaction[]>(
            `/account/${first.accountId}/transactions`,
          );
          if (cancelled) return;
          setTransactions(txRes.data);
        }
      } finally {
        if (!cancelled) setLoadingAcc(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sélection d'un compte — fetch ses transactions
  const selectAccount = async (account: Account) => {
    if (selected?.accountId === account.accountId) return;
    setSelected(account);
    setLoadingTx(true);
    try {
      const res = await api.get<Transaction[]>(
        `/account/${account.accountId}/transactions`,
      );
      setTransactions(res.data);
    } finally {
      setLoadingTx(false);
    }
  };

  const formatAmount = (amount: number) =>
    amount.toLocaleString("fr-FR") + " XAF";

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-60 flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Mes comptes</h2>
              <p className="text-sm text-gray-500">
                {accounts.length} compte{accounts.length > 1 ? "s" : ""} actif
                {accounts.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {loadingAcc ? (
          <div className="flex items-center justify-center h-60">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Chargement des comptes...</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-6 flex-col xl:flex-row">
            {/* ── Colonne gauche : cartes comptes ── */}
            <div className="flex flex-col gap-4 xl:w-80 shrink-0">
              {accounts.map((account) => {
                const isSelected = selected?.accountId === account.accountId;
                return (
                  <button
                    key={account.accountId}
                    onClick={() => selectAccount(account)}
                    className={`text-left p-5 rounded-2xl border-2 transition-all shadow-sm hover:shadow-md
                      ${
                        isSelected
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-blue-300"
                      }`}
                  >
                    {/* Badge type + devise */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full
                        ${
                          account.accountType === "Courant"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {account.accountType}
                      </span>
                      <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {account.currency}
                      </span>
                    </div>

                    {/* Solde */}
                    <div className="text-2xl font-bold text-slate-800 mb-1">
                      {formatAmount(account.balance)}
                    </div>

                    {/* Numéro */}
                    <div className="text-xs text-gray-500 font-mono tracking-wide">
                      {account.accountNumber}
                    </div>

                    {/* Date ouverture */}
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                      <BadgeCheck className="w-3.5 h-3.5 text-green-500" />
                      Ouvert le{" "}
                      {new Date(account.openedAt).toLocaleDateString("fr-FR")}
                    </div>
                  </button>
                );
              })}

              {/* Bouton virement rapide */}
              <button
                onClick={() => navigate("/transactions")}
                className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 transition-all font-medium text-sm"
              >
                <ArrowRightLeft className="w-4 h-4" />
                Nouveau virement
              </button>
            </div>

            {/* ── Colonne droite : transactions ── */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header transactions */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Historique des transactions
                  </h3>
                  {selected && (
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      {selected.accountNumber}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {transactions.length > 0 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                      {transactions.length} opération
                      {transactions.length > 1 ? "s" : ""}
                    </span>
                  )}
                  {loadingTx && (
                    <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                  )}
                </div>
              </div>

              {/* Liste */}
              <div className="divide-y divide-gray-50">
                {loadingTx ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <Inbox className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-sm">Aucune transaction pour ce compte</p>
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.transactionId}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      {/* Icône */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
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
                        <div className="font-medium text-slate-700 text-sm truncate">
                          {tx.description ?? tx.transactionType}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {formatDate(tx.transactionDate)}
                        </div>
                      </div>

                      {/* Montant + statut */}
                      <div className="text-right shrink-0">
                        <div
                          className={`font-bold text-sm
                          ${tx.direction === "Crédit" ? "text-green-600" : "text-red-500"}`}
                        >
                          {tx.direction === "Crédit" ? "+" : "-"}
                          {formatAmount(tx.amount)}
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-1">
                          {statusIcon(tx.status)}
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
