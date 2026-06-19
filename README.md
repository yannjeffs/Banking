# E-Banking & Loan Management System

Application web bancaire complète permettant la gestion des comptes, des virements et des prêts, avec une interface Client et un panel Administrateur dédié.

> Projet académique réalisé avec React (TypeScript), ASP.NET Core et SQL Server.

---

## Sommaire

- [Aperçu](#aperçu)
- [Stack technique](#stack-technique)
- [Architecture du projet](#architecture-du-projet)
- [Fonctionnalités](#fonctionnalités)
- [Schéma de la base de données](#schéma-de-la-base-de-données)
- [Installation](#installation)
- [Configuration](#configuration)
- [Lancer le projet](#lancer-le-projet)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Structure des dossiers](#structure-des-dossiers)
- [Roadmap](#roadmap)

---

## Aperçu

Ce projet simule une plateforme e-banking complète à deux niveaux d'accès :

- **Espace Client** — consultation des comptes, virements entre comptes, demande de prêt et suivi des remboursements.
- **Espace Administrateur** — supervision globale de la banque : gestion des clients, des comptes, validation des prêts, suivi des transactions et opérations manuelles de dépôt/retrait.

---

## Stack technique

| Couche | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide React |
| Backend | ASP.NET Core 8, Entity Framework Core, JWT Authentication, BCrypt.Net |
| Base de données | SQL Server (SSMS) |
| Outils | Visual Studio Code, REST Client (tests API) |

---

## Architecture du projet

```
e-banking/
├── backend/                # API ASP.NET Core
│   ├── Controllers/        # AuthController, AccountController, TransactionController, LoanController, AdminController
│   ├── Models/              # Entités EF Core (User, Account, Transaction, Loan, LoanPayment)
│   ├── DTOs/                # Objets de transfert (Auth, Admin, Account...)
│   ├── Data/                # AppDbContext
│   ├── Program.cs
│   └── appsettings.json
│
├── frontend/                # Application React
│   └── src/
│       ├── api/             # Instance Axios configurée
│       ├── context/         # AuthContext + AuthProvider
│       ├── hooks/           # useAuth
│       ├── components/      # Sidebar, PrivateRoute, AdminRoute...
│       ├── pages/           # Login, Register, Dashboard, Accounts, Transactions, Loans
│       │   └── admin/       # AdminDashboard, AdminClients, AdminAccounts, AdminLoans, AdminTransactions, AdminDeposits
│       ├── types/           # Interfaces TypeScript partagées
│       └── App.tsx
│
└── test.http                 # Collection de requêtes de test (REST Client)
```

---

## Fonctionnalités

### Espace Client

- Inscription et connexion sécurisées (JWT)
- Tableau de bord avec soldes, graphique des comptes et transactions récentes
- Consultation détaillée de chaque compte et de son historique
- Virements entre comptes bancaires avec vérification de solde
- Demande de prêt avec calcul de mensualité en temps réel
- Suivi des prêts et tableau d'amortissement complet

### Espace Administrateur

- Tableau de bord global avec statistiques de la banque
- Gestion des clients : recherche, activation/désactivation, promotion en Admin
- Gestion des comptes : création, activation/désactivation, vue consolidée
- Gestion des prêts : approbation, rejet, déblocage des fonds
- Suivi de toutes les transactions avec filtres et pagination
- Opérations manuelles de dépôt et retrait sur n'importe quel compte

### Sécurité

- Authentification par token JWT
- Mots de passe hachés avec BCrypt
- Autorisation par rôle (`Client` / `Admin`) sur les endpoints sensibles
- Routes frontend protégées (`PrivateRoute`, `AdminRoute`) avec redirection automatique selon le rôle

---

## Schéma de la base de données

| Table | Description |
|---|---|
| `Users` | Comptes utilisateurs (Client ou Admin), identifiants et rôle |
| `Accounts` | Comptes bancaires liés à un utilisateur (Courant / Épargne) |
| `Transactions` | Historique des virements, dépôts et retraits |
| `Loans` | Demandes et suivi des prêts (montant, taux, durée, statut) |
| `LoanPayments` | Détail des remboursements de prêts (tableau d'amortissement) |

Le script SQL complet de création des tables se trouve dans la documentation du projet et doit être exécuté dans SSMS avant le premier lancement du backend.

---

## Installation

### Prérequis

- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- [.NET SDK 8](https://dotnet.microsoft.com/download)
- SQL Server + SQL Server Management Studio (SSMS)
- Visual Studio Code avec l'extension **C# Dev Kit**

### Cloner le projet

```bash
git clone <url-du-repo>
cd e-banking
```

### Backend

```bash
cd backend
dotnet restore
```

### Frontend

```bash
cd frontend
npm install
```

---

## Configuration

### Base de données

1. Ouvrir SSMS et se connecter au serveur local (ex: `JEFFREY\SQLEXPRESS`)
2. Exécuter le script SQL de création de la base `EBankingDB` et de ses tables
3. Vérifier la chaîne de connexion dans `backend/appsettings.json` :

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=VOTRE_SERVEUR;Database=EBankingDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "EBankingSecretKey2024_MinimumLength32Chars!",
    "Issuer": "EBankingAPI",
    "Audience": "EBankingClient",
    "ExpiresInMinutes": 60
  }
}
```

### Frontend

Vérifier que l'URL de l'API dans `frontend/src/api/axios.ts` correspond bien au port du backend :

```ts
const api = axios.create({
  baseURL: 'http://localhost:5171/api',
});
```

---

## Lancer le projet

### 1. Démarrer le backend

```bash
cd backend
dotnet run
```

L'API est accessible sur `http://localhost:5171`.

### 2. Démarrer le frontend

Dans un second terminal :

```bash
cd frontend
npm run dev
```

L'application est accessible sur `http://localhost:5173`.

---

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | admin@ebanking.cm | Admin1234! |
| Client | client@ebanking.cm | Client1234! |

> À adapter selon les comptes réellement créés dans la base de données locale.

---

## Structure des dossiers

Le projet suit une séparation stricte entre logique métier (backend) et présentation (frontend), avec un typage fort de bout en bout grâce à TypeScript côté client et aux DTOs côté serveur, garantissant que les données échangées entre les deux couches restent toujours cohérentes.

Les composants React respectent une convention claire : un fichier `.tsx` n'exporte qu'un seul composant, tandis que les contextes, hooks et types vivent chacun dans leur propre fichier pour préserver le Fast Refresh de Vite.

---

## Roadmap

- [ ] Application mobile (React Native)
- [ ] Notifications en temps réel (SignalR)
- [ ] Export PDF des relevés de compte
- [ ] Authentification à deux facteurs (2FA)
- [ ] Historique d'audit des actions administrateur
- [ ] Tests unitaires et d'intégration

---

## Licence

Projet académique à but pédagogique — non destiné à un usage en production.