import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const links = [
  { to: "/dashboard", icon: "🏠", label: "Tableau de bord" },
  { to: "/accounts", icon: "🏦", label: "Mes comptes" },
  { to: "/transactions", icon: "💸", label: "Virements" },
  { to: "/loans", icon: "📋", label: "Prêts" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <span style={styles.brandIcon}>🏛</span>
        <span style={styles.brandName}>E-Banking</span>
      </div>

      <div style={styles.userInfo}>
        <div style={styles.avatar}>{user?.fullName?.[0] ?? "U"}</div>
        <div>
          <div style={styles.userName}>{user?.fullName}</div>
          <div style={styles.userRole}>{user?.role}</div>
        </div>
      </div>

      <nav style={styles.nav}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.linkActive : {}),
            })}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <button style={styles.logout} onClick={handleLogout}>
        🚪 Déconnexion
      </button>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "240px",
    minHeight: "100vh",
    background: "#1e3a5f",
    color: "#fff",
    display: "flex",
    flexDirection: "column" as const,
    padding: "1.5rem 0",
    position: "fixed" as const,
    left: 0,
    top: 0,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0 1.5rem",
    marginBottom: "2rem",
  },
  brandIcon: { fontSize: "1.8rem" },
  brandName: { fontSize: "1.3rem", fontWeight: "700", color: "#60a5fa" },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1.5rem",
    background: "#243f6a",
    marginBottom: "1.5rem",
  },
  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#1a56db",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "1.1rem",
  },
  userName: { fontWeight: "600", fontSize: "0.9rem" },
  userRole: { fontSize: "0.75rem", color: "#93c5fd" },
  nav: {
    display: "flex",
    flexDirection: "column" as const,
    flex: 1,
    padding: "0 0.75rem",
    gap: "0.25rem",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.7rem 0.75rem",
    borderRadius: "8px",
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "0.95rem",
  },
  linkActive: { background: "#1a56db", color: "#fff", fontWeight: "600" },
  logout: {
    margin: "1rem 0.75rem 0",
    padding: "0.65rem",
    background: "transparent",
    border: "1px solid #475569",
    borderRadius: "8px",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
} satisfies Record<string, React.CSSProperties>;
