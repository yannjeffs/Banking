import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Loans from './pages/Loans';
import { AuthProvider } from './context/AuthProvider';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/accounts" element={
            <PrivateRoute><Accounts /></PrivateRoute>
          } />
          <Route path="/transactions" element={
            <PrivateRoute><Transactions /></PrivateRoute>
          } />
          <Route path="/loans" element={
            <PrivateRoute><Loans /></PrivateRoute>
          } />*
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}