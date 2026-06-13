import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

interface RegisterForm {
  firstName: string;
  lastName:  string;
  email:     string;
  password:  string;
  phone:     string;
}

export default function Register() {
  const [form, setForm]       = useState<RegisterForm>({
    firstName: '',
    lastName:  '',
    email:     '',
    password:  '',
    phone:     '',
  });
  const [error, setError]     = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate              = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post<{ accountNumber: string }>('/auth/register', form);
      setSuccess(`Compte créé avec succès ! Numéro : ${res.data.accountNumber}`);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Créer un compte</h1>
        <p style={styles.subtitle}>Rejoignez E-Banking dès aujourd'hui</p>

        {error   && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Prénom</label>
              <input
                style={styles.input}
                name="firstName"
                placeholder="Jean"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Nom</label>
              <input
                style={styles.input}
                name="lastName"
                placeholder="Dupont"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            name="email"
            type="email"
            placeholder="jean@example.cm"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Téléphone</label>
          <input
            style={styles.input}
            name="phone"
            type="tel"
            placeholder="+237600000000"
            value={form.phone}
            onChange={handleChange}
          />

          <label style={styles.label}>Mot de passe</label>
          <input
            style={styles.input}
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Création en cours...' : 'Créer mon compte'}
          </button>
        </form>

        <p style={styles.link}>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:     { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' },
  card:     { background: '#fff', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '480px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  title:    { textAlign: 'center', color: '#1a56db', fontSize: '1.8rem', margin: '0 0 4px' },
  subtitle: { textAlign: 'center', color: '#6b7280', marginBottom: '1.5rem' },
  form:     { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  row:      { display: 'flex', gap: '1rem' },
  col:      { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  label:    { fontWeight: '500', color: '#374151', fontSize: '0.9rem' },
  input:    { padding: '0.65rem 1rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  button:   { marginTop: '0.5rem', padding: '0.75rem', background: '#1a56db', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: '600' },
  error:    { background: '#fee2e2', color: '#b91c1c', padding: '0.65rem 1rem', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.9rem' },
  success:  { background: '#d1fae5', color: '#065f46', padding: '0.65rem 1rem', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.9rem' },
  link:     { textAlign: 'center', marginTop: '1.25rem', color: '#6b7280', fontSize: '0.9rem' },
};