import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import api from "../api/axios";
import type { AuthResponse, UserRole } from "../types";
import { useAuth } from "../hooks/useAuth";
import { StaffRoles } from "../utils/permissions";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { user } = useAuth();

  // Déjà connecté → redirection directe selon le rôle
  if (user) {
    return (
      <Navigate
        to={user.role === "Admin" ? "/admin/dashboard" : "/dashboard"}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post<AuthResponse>("/auth/login", form);
      login(
        {
          userId: res.data.userId,
          fullName: res.data.fullName,
          email: res.data.email,
          role: res.data.role as "Client" | "Admin",
        },
        res.data.token,
      );

      // Redirection conditionnelle selon le rôle
      const role = res.data.role as UserRole;
      navigate(StaffRoles.includes(role) ? "/admin/dashboard" : "/dashboard");
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>E-Banking</h1>
        <p style={styles.subtitle}>Connectez-vous à votre espace</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="jean@example.cm"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <label style={styles.label}>Mot de passe</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p style={styles.link}>
          Pas encore de compte ? <Link to="/register">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0f4f8",
  },
  card: {
    background: "#fff",
    padding: "2.5rem",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  title: {
    textAlign: "center",
    color: "#1a56db",
    fontSize: "2rem",
    margin: "0 0 4px",
  },
  subtitle: { textAlign: "center", color: "#6b7280", marginBottom: "1.5rem" },
  form: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  label: { fontWeight: "500", color: "#374151", fontSize: "0.9rem" },
  input: {
    padding: "0.65rem 1rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "1rem",
    outline: "none",
  },
  button: {
    marginTop: "0.5rem",
    padding: "0.75rem",
    background: "#1a56db",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: "600",
  },
  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "0.65rem 1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    fontSize: "0.9rem",
  },
  link: {
    textAlign: "center",
    marginTop: "1.25rem",
    color: "#6b7280",
    fontSize: "0.9rem",
  },
};
