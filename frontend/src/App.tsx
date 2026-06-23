import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import PrivateRoute from "./components/PrivateRoute";

// Pages Client
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Loans from "./pages/Loans";

// Pages Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClients from "./pages/admin/AdminClients";
import AdminAccounts from "./pages/admin/AdminAccounts";
import AdminLoans from "./pages/admin/AdminLoans";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminDeposits from "./pages/admin/AdminDeposits";
import AdminSettings from "./pages/admin/AdminSettings";
import StaffRoute from "./components/StaffRoute";
import AdminStaff from "./pages/admin/AdminStaff";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Routes Client */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/accounts"
            element={
              <PrivateRoute>
                <Accounts />
              </PrivateRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <Transactions />
              </PrivateRoute>
            }
          />
          <Route
            path="/loans"
            element={
              <PrivateRoute>
                <Loans />
              </PrivateRoute>
            }
          />

          {/* Routes Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <StaffRoute>
                <AdminDashboard />
              </StaffRoute>
            }
          />
          <Route
            path="/admin/clients"
            element={
              <StaffRoute>
                <AdminClients />
              </StaffRoute>
            }
          />
          <Route
            path="/admin/accounts"
            element={
              <StaffRoute>
                <AdminAccounts />
              </StaffRoute>
            }
          />
          <Route
            path="/admin/loans"
            element={
              <StaffRoute>
                <AdminLoans />
              </StaffRoute>
            }
          />
          <Route
            path="/admin/transactions"
            element={
              <StaffRoute>
                <AdminTransactions />
              </StaffRoute>
            }
          />
          <Route
            path="/admin/deposits"
            element={
              <StaffRoute>
                <AdminDeposits />
              </StaffRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <StaffRoute>
                <AdminSettings />
              </StaffRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <StaffRoute>
                <AdminStaff />
              </StaffRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
