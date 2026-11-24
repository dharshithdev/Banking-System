# Bank Manager Dashboard

A full-stack banking operations dashboard for customer profiles, accounts, loans, and the transaction ledger.

## Features

- JWT manager login and role-protected banking APIs.
- Paginated customer, account, loan, and transaction views.
- Customer detail panels and deletion guards that preserve linked financial history.
- Account opening, atomic active-account deposits and withdrawals, and ledger entries.
- Loan applications and pending-only approval with persisted EMI calculation.
- Request validation, NoSQL key rejection, security headers, request-size limits, rate limiting, and centralized errors.

## Project Structure

```text
banking-system/
├── SECURITY_AUDIT.md
├── backend/
│   ├── server.js
│   ├── seed.js
│   ├── config/db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validate.js
│   │   ├── errorHandler.js
│   │   └── rateLimit.js
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   └── utils/db.js
└── frontend/
    ├── src/api/
    ├── src/components/
    ├── src/features/
    ├── src/hooks/
    ├── src/pages/
    └── src/utils/
```

The backend follows **routes → controllers → services → repositories → models**. Controllers do not query Mongoose models directly. Frontend components use the shared API client.

## Requirements

- Node.js 18 or newer
- MongoDB 6 or newer, running locally or available through a MongoDB URI

## Local Setup

Start MongoDB, then run these commands in separate terminals:

```bash
cd backend
npm install
cp .env.example .env   # if .env does not exist
npm run seed           # resets the local database to sample data
npm start              # http://localhost:3000
```

```bash
cd frontend
npm install
cp .env.example .env   # if .env does not exist
npm run dev            # http://localhost:5173
```

Set `SEED_MANAGER_EMAIL` and `SEED_MANAGER_PASSWORD` in `backend/.env`, then run `npm run seed` to create or update the initial manager account. The seed password must be at least 12 characters. Set `JWT_SECRET` to a unique random value of at least 32 characters before starting the server; startup rejects the example placeholder in every environment. Email 2FA is enabled by default, so configure the SMTP settings below before starting the backend.

## Configuration

### Backend: `backend/.env`

| Variable | Local default | Description |
| --- | --- | --- |
| `PORT` | `3000` | API listen port |
| `NODE_ENV` | `development` | Runtime environment |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/banking_system` | MongoDB connection |
| `CORS_ORIGIN` | `http://localhost:5173` | Comma-separated frontend origin allowlist |
| `SEED_MANAGER_NAME` | `Bank Manager` | Initial manager display name |
| `SEED_MANAGER_EMAIL` | Set locally | Initial manager login email, stored lowercase |
| `SEED_MANAGER_PASSWORD` | Set locally | Initial manager password, hashed during seeding |
| `JWT_SECRET` | Rejected placeholder in `.env.example` | Unique HMAC signing secret of at least 32 characters |
| `EMAIL_2FA_ENABLED` | `true` | Enables email OTP verification during manager sign-in; SMTP settings are required when enabled |
| `SMTP_HOST` | Set locally | SMTP server hostname |
| `SMTP_PORT` | `587` in example | SMTP server port; port 465 uses TLS |
| `SMTP_USER` | Set locally | SMTP authentication username |
| `SMTP_PASS` | Set locally | SMTP authentication password |
| `SMTP_FROM` | Set locally | Sender name and email address |

### Frontend: `frontend/.env`

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:3000/api` | API base URL |
| `VITE_PORT` | `5173` | Vite development port |

## Authentication and API

Base URL: `http://localhost:3000/api`.

Manager sign-in uses two steps. `POST /api/auth/login` accepts `{ "email": "…", "password": "…" }`, verifies the scrypt password, emails a cryptographically random six-digit OTP, and returns `{ "requiresOtp": true, "email", "message" }`. It does not issue a session cookie yet. OTP hashes are salted SHA-256 values stored in MongoDB with a five-minute expiration and a five-attempt limit. `POST /api/auth/verify-otp` accepts `{ "email", "otp" }`; successful verification clears the challenge, records a `LOGIN_2FA_VERIFIED` audit entry, and sets the existing one-hour HttpOnly SameSite=Strict JWT cookie. `POST /api/auth/resend-otp` can resend a code for an active challenge. Login, verification, and resend endpoints are rate limited. The frontend sends credentialed requests using the cookie. `POST /api/auth/logout` revokes the session and clears the cookie. API clients may also send `Authorization: Bearer <token>`. Banking routes require the manager role.

Password recovery is available through `POST /api/auth/forgot-password` with `{ "email" }` and `POST /api/auth/reset-password` with `{ "email", "otp", "newPassword" }`. Both endpoints are rate limited. The forgot endpoint always responds with the same generic `200` message whether or not the email exists. Reset codes are separate from login 2FA, cryptographically random, stored as salted SHA-256 hashes, expire after five minutes, and lock out after five failed attempts. Passwords are stored using scrypt. A successful reset atomically clears the challenge and increments `tokenVersion`, revoking every existing JWT cookie and bearer token; it also writes a `PASSWORD_RESET` audit entry and clears the browser auth cookie. See [SECURITY_AUDIT.md](SECURITY_AUDIT.md).

| Resource | Routes |
| --- | --- |
| Authentication | `POST /auth/login`, `POST /auth/verify-otp`, `POST /auth/resend-otp`, `POST /auth/logout`, `GET /auth/me` |
| Customers | `GET /customers`, `GET /customers/:id`, `POST /customers`, `PUT /customers/:id`, `DELETE /customers/:id` |
| Accounts | `GET /accounts`, `GET /accounts/:id`, `GET /accounts/customer/:customerId`, `POST /accounts`, `POST /accounts/:id/deposit`, `POST /accounts/:id/withdraw` |
| Loans | `GET /loans`, `GET /loans/:id`, `GET /loans/customer/:customerId`, `POST /loans`, `POST /loans/:id/approve` |
| Transactions | `GET /transactions`, `GET /transactions/account/:accountId` |

List endpoints accept `page` and `limit` query parameters. Account amounts must be finite positive numbers. Loan approval persists EMI using the reducing-balance formula, with a zero-interest case. Customer deletion returns `409` when accounts or loans are linked. API errors use `{ "error": "…" }`.

## Security Notes

The application uses standard security headers, a 10 KB JSON request limit, restrictive CORS, in-memory API and authentication rate limits, ObjectId and payload validation, NoSQL operator-key rejection, and centralized error handling. See [SECURITY_AUDIT.md](SECURITY_AUDIT.md) for security implementation and verification notes.
