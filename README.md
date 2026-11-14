# Banking System – Bank Manager Dashboard

A full-stack web application that lets a bank manager run day-to-day operations: maintain customer records, open and operate accounts, process loan applications and review the transaction ledger.

| Layer    | Technology                                             |
| -------- | ------------------------------------------------------ |
| Frontend | React (JSX), Vite, Tailwind CSS, React Router          |
| Backend  | Node.js, Express                                       |
| Database | MongoDB (via Mongoose)                                 |

## Features

### Customers
- Paginated customer list
- Create and edit customer profiles
- Customer detail panel showing the customer's accounts and loans
- Delete customers

### Accounts
- Paginated account list with customer name, type, balance and status
- Open Savings, Current and Fixed Deposit accounts for an existing customer
- Deposit and withdraw funds
- Jump from an account straight to its transaction history

### Loans
- Paginated loan list showing principal, rate, tenure, EMI, outstanding amount and status
- Submit loan applications (Personal, Home, Car, Education)
- Approve pending loan applications; the monthly EMI is derived from principal, interest rate and tenure

### Transactions
- Paginated ledger of all credits and debits, newest first
- Filter the ledger by account

## Project Structure

```
banking-system/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── seed.js                # Loads sample data into MongoDB
│   ├── config/db.js           # MongoDB connection
│   ├── models/                # Mongoose schemas (Customer, Account, Loan, Transaction, Counter)
│   ├── routes/                # URL → controller mapping
│   ├── controllers/           # HTTP request / response handling
│   ├── services/              # Business rules
│   ├── repositories/          # Database access
│   ├── utils/db.js            # Pagination, id validation, serialization helpers
│   ├── .env                   # Local configuration
│   └── .env.example           # Configuration template
└── frontend/
    ├── index.html
    ├── tailwind.config.js     # Banking theme (navy / gold palette)
    ├── .env                   # Local configuration
    ├── .env.example           # Configuration template
    └── src/
        ├── api/               # All backend communication (one module per resource)
        ├── components/        # Reusable UI: Layout, DataTable, Pagination, Modal, Toast, ...
        ├── features/          # Forms, dialogs and panels tied to a domain
        ├── hooks/             # usePaginated, useLookups
        ├── pages/             # Customers, Accounts, Loans, Transactions
        └── utils/             # Currency and date formatting
```

The backend follows a layered design: **routes → controllers → services → repositories → models**.
The frontend never calls `fetch` directly from a component; every request goes through the `src/api` modules.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- [MongoDB](https://www.mongodb.com/try/download/community) 6 or newer, running locally (or a MongoDB Atlas connection string)

## Getting Started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env     # skip if .env already exists
npm run seed             # loads sample customers, accounts, loans and transactions
npm start                # http://localhost:3000
```

Use `npm run dev` for auto-restart on file changes. Running `npm run seed` again resets the database to the sample data.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env     # skip if .env already exists
npm run dev              # http://localhost:5173
```

Open http://localhost:5173 in your browser.

## Configuration

### Backend – `backend/.env`

| Variable      | Default                                      | Description                                  |
| ------------- | -------------------------------------------- | -------------------------------------------- |
| `PORT`        | `3000`                                       | Port the API listens on                      |
| `NODE_ENV`    | `development`                                | Runtime environment                          |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/banking_system`   | MongoDB connection string                    |
| `CORS_ORIGIN` | `http://localhost:5173`                      | Comma-separated list of allowed frontend origins |

### Frontend – `frontend/.env`

| Variable            | Default                     | Description                  |
| ------------------- | --------------------------- | ---------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:3000/api` | Base URL of the backend API  |
| `VITE_PORT`         | `5173`                      | Dev server port              |

## API Reference

Base URL: `http://localhost:3000/api`

All list endpoints are paginated with `?page=<n>&limit=<n>` (limit is capped at 100) and respond with:

```json
{ "data": [], "total": 0, "page": 1, "limit": 5, "totalPages": 1 }
```

Resource identifiers are MongoDB ObjectIds, exposed as `id`.

### Customers

| Method | Endpoint                | Description                                   |
| ------ | ----------------------- | --------------------------------------------- |
| GET    | `/customers`            | List customers (paginated)                    |
| GET    | `/customers/:id`        | Customer details with their accounts and loans |
| POST   | `/customers`            | Create a customer (`name`, `email`, `phone`, `address`) |
| PUT    | `/customers/:id`        | Update a customer                             |
| DELETE | `/customers/:id`        | Delete a customer                             |

### Accounts

| Method | Endpoint                         | Description                                  |
| ------ | -------------------------------- | -------------------------------------------- |
| GET    | `/accounts`                      | List accounts (paginated)                    |
| GET    | `/accounts/:id`                  | Account details                              |
| GET    | `/accounts/customer/:customerId` | All accounts of a customer                   |
| POST   | `/accounts`                      | Open an account (`customerId`, `type`, `balance`) |
| POST   | `/accounts/:id/deposit`          | Deposit funds (`amount`, `description`)      |
| POST   | `/accounts/:id/withdraw`         | Withdraw funds (`amount`, `description`)     |

Account types: `Savings`, `Current`, `Fixed Deposit`.

### Loans

| Method | Endpoint                      | Description                                           |
| ------ | ----------------------------- | ----------------------------------------------------- |
| GET    | `/loans`                      | List loans (paginated)                                |
| GET    | `/loans/:id`                  | Loan details                                          |
| GET    | `/loans/customer/:customerId` | All loans of a customer                               |
| POST   | `/loans`                      | Apply for a loan (`customerId`, `accountId`, `type`, `principal`, `interestRate`, `tenureMonths`) |
| POST   | `/loans/:id/approve`          | Approve a pending loan                                |

Loan types: `Personal`, `Home`, `Car`, `Education`. Loan statuses: `Pending`, `Approved`.

The monthly EMI uses the standard reducing-balance formula:

```
r   = annualInterestRate / 12 / 100
EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)
```

where `P` is the principal and `n` the tenure in months.

### Transactions

| Method | Endpoint                          | Description                              |
| ------ | --------------------------------- | ---------------------------------------- |
| GET    | `/transactions`                   | Ledger across all accounts, newest first |
| GET    | `/transactions/account/:accountId` | Ledger of a single account               |

Transaction types: `Credit`, `Debit`.

## Data Model

| Collection     | Key fields                                                                                   |
| -------------- | -------------------------------------------------------------------------------------------- |
| `customers`    | `name`, `email`, `phone`, `address`, `createdAt`                                             |
| `accounts`     | `customerId`, `accountNumber`, `type`, `balance`, `status`, `openedAt`                       |
| `loans`        | `customerId`, `accountId`, `loanNumber`, `type`, `principal`, `interestRate`, `tenureMonths`, `status`, `emi`, `outstanding`, `appliedAt`, `approvedAt` |
| `transactions` | `accountId`, `type`, `amount`, `description`, `balanceAfter`, `timestamp`                    |
| `counters`     | Sequence generator for account (`ACC000001`) and loan (`LN000001`) numbers                   |
