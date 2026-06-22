import { useEffect, useState } from "react";
import {
  Settings,
  Save,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import api from "../../api/axios";

interface BankSetting {
  settingId: number;
  settingKey: string;
  settingValue: string;
  description: string | null;
  updatedAt: string;
}

const settingLabels: Record<string, string> = {
  LoanMaxAmount: "Montant maximum d'un prêt (XAF)",
  LoanMinAmount: "Montant minimum d'un prêt (XAF)",
  LoanMaxActive: "Nombre maximum de prêts actifs simultanés",
  LoanMaxTermMonths: "Durée maximale d'un prêt (mois)",
  LoanMinTermMonths: "Durée minimale d'un prêt (mois)",
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<BankSetting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get<BankSetting[]>("/admin/settings");
        if (cancelled) return;
        setSettings(res.data);
        const vals: Record<string, string> = {};
        res.data.forEach((s) => {
          vals[s.settingKey] = s.settingValue;
        });
        setValues(vals);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (key: string) => {
    setSaving(key);
    setError("");
    setSuccess("");
    try {
      await api.put(`/admin/settings/${key}`, { value: values[key] });
      setSettings((prev) =>
        prev.map((s) =>
          s.settingKey === key
            ? {
                ...s,
                settingValue: values[key],
                updatedAt: new Date().toISOString(),
              }
            : s,
        ),
      );
      setSuccess(`Paramètre "${settingLabels[key] ?? key}" mis à jour.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Erreur lors de la mise à jour.");
    } finally {
      setSaving(null);
    }
  };

  const fmt = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="ml-60 flex-1 p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Paramètres de la banque
            </h2>
            <p className="text-sm text-gray-500">
              Configurez les règles et limites globales
            </p>
          </div>
        </div>

        {/* Alertes */}
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Section prêts */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  Règles des prêts
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Ces paramètres s'appliquent immédiatement à toutes les
                  nouvelles demandes de prêt.
                </p>
              </div>

              <div className="divide-y divide-gray-50">
                {settings.map((setting) => (
                  <div
                    key={setting.settingId}
                    className="flex flex-wrap items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-700">
                        {settingLabels[setting.settingKey] ??
                          setting.settingKey}
                      </div>
                      {setting.description && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {setting.description}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Modifié le {fmt(setting.updatedAt)}
                      </div>
                    </div>

                    {/* Input + Save */}
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        min="0"
                        value={values[setting.settingKey] ?? ""}
                        onChange={(e) =>
                          setValues((prev) => ({
                            ...prev,
                            [setting.settingKey]: e.target.value,
                          }))
                        }
                        className="w-36 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleSave(setting.settingKey)}
                        disabled={
                          saving === setting.settingKey ||
                          values[setting.settingKey] === setting.settingValue
                        }
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-medium rounded-xl transition-colors"
                      >
                        {saving === setting.settingKey ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info box */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">À savoir</p>
                <ul className="flex flex-col gap-1 text-xs text-blue-600">
                  <li>
                    • Les modifications s'appliquent uniquement aux nouvelles
                    demandes de prêt.
                  </li>
                  <li>
                    • Les prêts en cours ne sont pas affectés par ces
                    changements.
                  </li>
                  <li>
                    • Le bouton "Sauvegarder" n'est actif que si la valeur a été
                    modifiée.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
