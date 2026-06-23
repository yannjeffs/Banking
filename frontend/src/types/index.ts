export interface User {
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
}

export type UserRole =
  | 'Admin'
  | 'Superviseur'
  | 'GestionnaireComptes'
  | 'AgentCredit'
  | 'Caissier'
  | 'Auditeur'
  | 'Client';

export interface StaffUser {
  userId:    number;
  fullName:  string;
  email:     string;
  phone:     string | null;
  role:      UserRole;
  isActive:  boolean;
  createdAt: string;
}

export interface Account {
  accountId: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  openedAt: string;
}

export interface Transaction {
  transactionId: number;
  amount: number;
  transactionType: string;
  description: string | null;
  transactionDate: string;
  status: string;
  direction: "Débit" | "Crédit";
}

export interface Loan {
  loanId: number;
  amount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  fullName: string;
  email: string;
  role: string;
  userId: number;
}

export interface AdminStats {
  totalUsers: number;
  totalAccounts: number;
  totalLoans: number;
  pendingLoans: number;
  activeLoans: number;
  totalDeposits: number;
  totalLoanAmount: number;
  totalTransactions: number;
}

export interface AdminUser {
  userId: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  isActive: boolean;
  accountCount: number;
  totalBalance: number;
}

export interface AdminAccount {
  accountId: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  openedAt: string;
  isActive: boolean;
  ownerName: string;
  ownerEmail: string;
}

export interface AdminTransaction {
  transactionId: number;
  amount: number;
  transactionType: string;
  description: string | null;
  transactionDate: string;
  status: string;
  fromAccount: string | null;
  toAccount: string | null;
}

export interface AdminLoan {
  loanId: number;
  ownerName: string;
  ownerEmail: string;
  accountNumber: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface Notification {
  notificationId: number;
  title: string;
  message: string;
  type: "Virement" | "Depot" | "Retrait" | "Pret" | "Systeme";
  isRead: boolean;
  createdAt: string;
}
