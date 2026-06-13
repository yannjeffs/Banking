import { useEffect, useState } from "react";
import {
  ArrowRightLeft,
  Send,
  PiggyBank,
  Banknote,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import type { Account } from "../types";

interface TransferForm {
  fromAccountId: number | "";
  toAccountNumber_Str: string;
  amount: number | "";
  description: string;
}

interface TransferResponse {
  message: string;
  transactionId: number;
}

const statusIcon = (status: string) => {
  switch (status) {
    case "Completee":
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case "En attente":
      return <Clock className="w-4 h-4 text-yellow-500" />;
    default:
      return <XCircle className="w-4 h-4 text-red-500" />;
  }
};

export default function Transactions() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [form, setForm] = useState<TransferForm>({
    fromAccountId: "",
    toAccountNumber_Str: "",
    amount: "",
    description: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    api.get<Account[]>("/account").then((res) => {
      setAccounts(res.data);
      if (res.data.length > 0)
        setForm((f) => ({ ...f, fromAccountId: res.data[0].accountId }));
    });
  }, []);

  const selectedAccount = accounts.find(
    (a) => a.accountId === form.fromAccountId,
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "fromAccountId" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post<TransferResponse>("/transaction/transfer", {
        ...form,
        amount: Number(form.amount),
      });
      setSuccess(res.data.message);
      setForm((f) => ({
        ...f,
        toAccountNumber_Str: "",
        amount: "",
        description: "",
      }));
      // Rafraîchir les soldes
      api.get<Account[]>("/account").then((r) => setAccounts(r.data));
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(message || "Erreur lors du virement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-60 flex-1 p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Virements</h2>
            <p className="text-sm text-gray-500">
              Transférez des fonds entre comptes
            </p>
          </div>
        </div>

        <div className="flex gap-6 flex-col xl:flex-row">
          {/* ── Formulaire de virement ── */}
          <div className="flex-1 max-w-xl">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                Nouveau virement
              </h3>

              {/* Alertes */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-3 mb-4 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Compte source */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Compte source
                  </label>
                  <div className="relative">
                    <select
                      name="fromAccountId"
                      value={form.fromAccountId}
                      onChange={handleChange}
                      className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {accounts.map((a) => (
                        <option key={a.accountId} value={a.accountId}>
                          {a.accountType} — {a.accountNumber} (
                          {a.balance.toLocaleString("fr-FR")} XAF)
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Solde disponible */}
                  {selectedAccount && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                      <PiggyBank className="w-3.5 h-3.5" />
                      Solde disponible :
                      <span className="font-semibold text-green-600">
                        {selectedAccount.balance.toLocaleString("fr-FR")} XAF
                      </span>
                    </div>
                  )}
                </div>

                {/* Compte destinataire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Numéro de compte destinataire
                  </label>
                  <input
                    name="toAccountNumber_Str"
                    type="text"
                    placeholder="BK-20240610-4823"
                    value={form.toAccountNumber_Str}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Montant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Montant (XAF)
                  </label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      name="amount"
                      type="number"
                      min="1"
                      placeholder="0"
                      value={form.amount}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                    <span className="text-gray-400 font-normal ml-1">
                      (optionnel)
                    </span>
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Ex : Paiement loyer, remboursement..."
                    value={form.description}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Bouton submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Effectuer le virement
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ── Panneau d'information ── */}
          <div className="xl:w-72 flex flex-col gap-4">
            {/* Récap soldes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-slate-800 mb-4 text-sm flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-blue-600" />
                Mes soldes
              </h3>
              <div className="flex flex-col gap-3">
                {accounts.map((a) => (
                  <div
                    key={a.accountId}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <div className="text-xs font-medium text-slate-700">
                        {a.accountType}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {a.accountNumber}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-green-600">
                      {a.balance.toLocaleString("fr-FR")} XAF
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conseils */}
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
              <h3 className="font-semibold text-blue-800 mb-3 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />À savoir
              </h3>
              <ul className="flex flex-col gap-2 text-xs text-blue-700">
                <li className="flex items-start gap-2">
                  {statusIcon("Completee")}
                  Les virements sont instantanés
                </li>
                <li className="flex items-start gap-2">
                  {statusIcon("Completee")}
                  Vérifiez bien le numéro destinataire
                </li>
                <li className="flex items-start gap-2">
                  {statusIcon("Completee")}
                  Solde insuffisant = virement refusé
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
