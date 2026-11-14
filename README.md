# Banking System – Bank Manager Dashboard (Assessment)

Intentionally incomplete project for evaluating interns.

## Structure

```
banking-system/
├── frontend/
│   ├── index.html
│   ├── css/
│   │   ├── styles.css
│   │   └── components.css
│   └── js/
│       ├── api.js
│       ├── utils.js
│       ├── customers.js
│       ├── accounts.js
│       ├── loans.js
│       ├── transactions.js
│       └── app.js
└── backend/
    ├── server.js
    ├── package.json
    ├── data/          (JSON storage)
    ├── routes/
    ├── controllers/
    ├── services/
    └── repositories/
```

## Run

```bash
cd backend
npm install
npm start
```

Open http://localhost:3000

## What Works

- Customers: list (paginated), view details, create, edit
- Accounts: list (paginated), open account, deposit
- Loans: list (paginated), apply, approve (status only)
- Transactions: list (paginated), filter by account
- Frontend modular JS + CSS, simple pagination

## Missing Functionalities (exactly 3)

1. **Delete Customer**  
   - No DELETE route / controller / service / repository method.

2. **Withdraw Money**  
   - `accountService.withdraw` throws “not implemented”.  
   - Frontend button exists but fails.

3. **EMI Calculation on Loan Approval**  
   - When approving a loan, `emi` is left as `null`.  
   - Interns must implement the standard EMI formula and set the value.

## Critical Bug (in an existing feature)

**Deposit does not update the account balance.**

- A Credit transaction is created with the correct `balanceAfter`.
- The success response is returned.
- But `accountRepository.updateBalance(...)` is never called.
- So the account balance in the system stays the same after a “successful” deposit.

This is the intentional critical bug for interns to find and fix.

## Out of Scope

- Authentication / security / middleware
- Real database
- Extra features beyond the 3 missing ones
