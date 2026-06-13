import { useEffect, useState } from 'react';
import {
  Landmark, Plus, X, TrendingUp, Calendar,
  CheckCircle2, Clock, XCircle, ChevronDown,
  AlertCircle, ReceiptText, Wallet, Info
} from 'lucide-react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import type { Account, Loan } from '../types';

interface LoanRequestForm {
  accountId:    number | '';
  amount:       number | '';
  interestRate: number | '';
  termMonths:   number | '';
}

interface LoanRequestResponse {
  message:        string;
  loanId:         number;
  monthlyPayment: number;
}

interface AmortizationRow {
  month:            number;
  payment:          number;
  principalPaid:    number;
  interestPaid:     number;
  remainingBalance: number;
}

const statusConfig: Record<string, { label: string; icon: JSX.Element; classes: string }> = {
  'En attente': {
    label:   'En attente',
    icon:    <Clock className="w-3.5 h-3.5" />,
    classes: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  'Actif': {
    label:   'Actif',
    icon:    <CheckCircle2 className="w-3.5 h-3.5" />,
    classes: 'bg-green-50 text-green-700 border-green-200',
  },
  'Rembourse': {
    label:   'Remboursé',
    icon:    <CheckCircle2 className="w-3.5 h-3.5" />,
    classes: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  'Rejete': {
    label:   'Rejeté',
    icon:    <XCircle className="w-3.5 h-3.5" />,
    classes: 'bg-red-50 text-red-700 border-red-200',
  },
  'Approuve': {
    label:   'Approuvé',
    icon:    <CheckCircle2 className="w-3.5 h-3.5" />,
    classes: 'bg-teal-50 text-teal-700 border-teal-200',
  },
};

// Calcul mensualité côté front (pour aperçu avant envoi)
const calcMonthlyPayment = (amount: number, rate: number, months: number): number => {
  if (rate === 0) return amount / months;
  const r = rate / 100 / 12;
  return (amount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
};

export default function Loans() {
  const [loans, setLoans]               = useState<Loan[]>([]);
  const [accounts, setAccounts]         = useState<Account[]>([]);
  const [showForm, setShowForm]         = useState<boolean>(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [schedule, setSchedule]         = useState<AmortizationRow[]>([]);
  const [loadingLoans, setLoadingLoans] = useState<boolean>(true);
  const [loadingSched, setLoadingSched] = useState<boolean>(false);
  const [loadingForm, setLoadingForm]   = useState<boolean>(false);
  const [success, setSuccess]           = useState<string>('');
  const [error, setError]               = useState<string>('');

  const [form, setForm] = useState<LoanRequestForm>({
    accountId:    '',
    amount:       '',
    interestRate: '',
    termMonths:   '',
  });

  useEffect(() => {
    Promise.all([
      api.get<Loan[]>('/loan'),
      api.get<Account[]>('/account'),
    ]).then(([loanRes, accRes]) => {
      setLoans(loanRes.data);
      setAccounts(accRes.data);
      if (accRes.data.length > 0)
        setForm(f => ({ ...f, accountId: accRes.data[0].accountId }));
    }).finally(() => setLoadingLoans(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'accountId' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post<LoanRequestResponse>('/loan/request', {
        accountId:    Number(form.accountId),
        amount:       Number(form.amount),
        interestRate: Number(form.interestRate),
        termMonths:   Number(form.termMonths),
      });
      setSuccess(
        `Demande soumise ! Mensualité estimée : ${res.data.monthlyPayment.toLocaleString('fr-FR')} XAF`
      );
      // Rafraîchir la liste
      api.get<Loan[]>('/loan').then(r => setLoans(r.data));
      setShowForm(false);
      setForm(f => ({ ...f, amount: '', interestRate: '', termMonths: '' }));
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(message || 'Erreur lors de la demande.');
    } finally {
      setLoadingForm(false);
    }
  };

  const viewSchedule = async (loan: Loan) => {
    if (selectedLoan?.loanId === loan.loanId) {
      setSelectedLoan(null);
      setSchedule([]);
      return;
    }
    setSelectedLoan(loan);
    setLoadingSched(true);
    try {
      const res = await api.get<AmortizationRow[]>(`/loan/${loan.loanId}/schedule`);
      setSchedule(res.data);
    } finally {
      setLoadingSched(false);
    }
  };

  // Aperçu mensualité en temps réel
  const preview = (
    form.amount && form.interestRate && form.termMonths
      ? calcMonthlyPayment(
          Number(form.amount),
          Number(form.interestRate),
          Number(form.termMonths)
        )
      : null
  );

  const fmt = (n: number) => n.toLocaleString('fr-FR');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-60 flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Landmark className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Prêts</h2>
              <p className="text-sm text-gray-500">Gérez vos demandes de prêt</p>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(f => !f); setError(''); setSuccess(''); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all
              ${showForm
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {showForm
              ? <><X className="w-4 h-4" /> Annuler</>
              : <><Plus className="w-4 h-4" /> Demander un prêt</>
            }
          </button>
        </div>

        {/* Alertes globales */}
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

        <div className="flex flex-col gap-6">

          {/* ── Formulaire de demande ── */}
          {showForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Nouvelle demande de prêt
              </h3>

              <form onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Compte de versement */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Compte de versement
                  </label>
                  <div className="relative">
                    <select
                      name="accountId"
                      value={form.accountId}
                      onChange={handleChange}
                      className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {accounts.map(a => (
                        <option key={a.accountId} value={a.accountId}>
                          {a.accountType} — {a.accountNumber}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Montant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Montant souhaité (XAF)
                  </label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      name="amount"
                      type="number"
                      min="1"
                      placeholder="500 000"
                      value={form.amount}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Taux d'intérêt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Taux d'intérêt annuel (%)
                  </label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      name="interestRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="8.50"
                      value={form.interestRate}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Durée */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Durée (mois)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      name="termMonths"
                      type="number"
                      min="1"
                      max="360"
                      placeholder="24"
                      value={form.termMonths}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Aperçu mensualité */}
                {preview && (
                  <div className="md:col-span-2 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <p className="text-sm text-blue-700">
                      Mensualité estimée :
                      <span className="font-bold ml-1">
                        {Math.round(preview).toLocaleString('fr-FR')} XAF / mois
                      </span>
                      <span className="text-blue-500 ml-1">
                        · Total : {Math.round(preview * Number(form.termMonths)).toLocaleString('fr-FR')} XAF
                      </span>
                    </p>
                  </div>
                )}

                {/* Bouton */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={loadingForm}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    {loadingForm ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Landmark className="w-4 h-4" />
                        Soumettre la demande
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Liste des prêts ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-blue-600" />
                Mes prêts
              </h3>
              {loans.length > 0 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                  {loans.length} prêt{loans.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {loadingLoans ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : loans.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <Landmark className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">Aucun prêt pour le moment</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {loans.map(loan => {
                  const cfg = statusConfig[loan.status] ?? statusConfig['En attente'];
                  const isSelected = selectedLoan?.loanId === loan.loanId;

                  return (
                    <div key={loan.loanId}>
                      {/* Ligne du prêt */}
                      <div className="flex flex-wrap items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">

                        {/* Icône */}
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                          <Landmark className="w-5 h-5 text-blue-600" />
                        </div>

                        {/* Infos principales */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-800">
                              {fmt(loan.amount)} XAF
                            </span>
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.classes}`}>
                              {cfg.icon}
                              {cfg.label}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-3">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {loan.interestRate}% / an
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {loan.termMonths} mois
                            </span>
                            <span className="flex items-center gap-1">
                              <Wallet className="w-3 h-3" />
                              {fmt(loan.monthlyPayment)} XAF / mois
                            </span>
                          </div>
                        </div>

                        {/* Bouton tableau d'amortissement */}
                        <button
                          onClick={() => viewSchedule(loan)}
                          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all
                            ${isSelected
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
                            }`}
                        >
                          <ReceiptText className="w-3.5 h-3.5" />
                          {isSelected ? 'Masquer' : 'Amortissement'}
                        </button>
                      </div>

                      {/* Tableau d'amortissement */}
                      {isSelected && (
                        <div className="px-6 pb-6 bg-gray-50 border-t border-gray-100">
                          <h4 className="text-sm font-semibold text-slate-700 py-3">
                            Tableau d'amortissement — Prêt #{loan.loanId}
                          </h4>

                          {loadingSched ? (
                            <div className="flex justify-center py-8">
                              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-gray-100 text-gray-600">
                                    <th className="px-4 py-2.5 text-left font-semibold">Mois</th>
                                    <th className="px-4 py-2.5 text-right font-semibold">Mensualité</th>
                                    <th className="px-4 py-2.5 text-right font-semibold">Capital</th>
                                    <th className="px-4 py-2.5 text-right font-semibold">Intérêts</th>
                                    <th className="px-4 py-2.5 text-right font-semibold">Reste dû</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                  {schedule.map(row => (
                                    <tr key={row.month}
                                      className="hover:bg-blue-50 transition-colors">
                                      <td className="px-4 py-2.5 font-medium text-slate-700">
                                        {row.month}
                                      </td>
                                      <td className="px-4 py-2.5 text-right text-slate-700">
                                        {fmt(row.payment)} XAF
                                      </td>
                                      <td className="px-4 py-2.5 text-right text-green-600 font-medium">
                                        {fmt(row.principalPaid)} XAF
                                      </td>
                                      <td className="px-4 py-2.5 text-right text-orange-500">
                                        {fmt(row.interestPaid)} XAF
                                      </td>
                                      <td className="px-4 py-2.5 text-right text-slate-500">
                                        {fmt(row.remainingBalance)} XAF
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}