require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Customer = require('./models/Customer');
const Account = require('./models/Account');
const Loan = require('./models/Loan');
const Transaction = require('./models/Transaction');
const Counter = require('./models/Counter');
const userRepository = require('./repositories/userRepository');
const { hashPassword } = require('./middleware/auth');

const customers = [
  { name: 'Rahul Sharma', email: 'rahul.sharma@email.com', phone: '9876543210', address: '12 MG Road, Bangalore, Karnataka', createdAt: '2024-01-15T10:00:00Z' },
  { name: 'Priya Patel', email: 'priya.patel@email.com', phone: '9123456780', address: '45 Park Street, Mumbai, Maharashtra', createdAt: '2024-02-20T11:30:00Z' },
  { name: 'Amit Kumar', email: 'amit.kumar@email.com', phone: '9988776655', address: '78 Civil Lines, Delhi', createdAt: '2024-03-05T09:15:00Z' },
  { name: 'Sneha Reddy', email: 'sneha.reddy@email.com', phone: '9876501234', address: '22 Jubilee Hills, Hyderabad', createdAt: '2024-04-12T08:00:00Z' },
  { name: 'Vikram Singh', email: 'vikram.singh@email.com', phone: '9765432109', address: '5 Sector 18, Noida', createdAt: '2024-05-01T13:20:00Z' }
];

// customer: index into `customers`
const accounts = [
  { customer: 0, type: 'Savings', balance: 45000.5, openedAt: '2024-01-16T10:00:00Z' },
  { customer: 0, type: 'Current', balance: 120000, openedAt: '2024-01-20T14:00:00Z' },
  { customer: 1, type: 'Savings', balance: 78500.75, openedAt: '2024-02-21T11:00:00Z' },
  { customer: 2, type: 'Savings', balance: 15000, openedAt: '2024-03-06T09:30:00Z' },
  { customer: 3, type: 'Savings', balance: 92000, openedAt: '2024-04-13T10:00:00Z' },
  { customer: 4, type: 'Current', balance: 250000, openedAt: '2024-05-02T11:00:00Z' }
];

// customer / account: index into `customers` / `accounts`
const loans = [
  { customer: 0, account: 0, type: 'Personal', principal: 200000, interestRate: 10.5, tenureMonths: 24, status: 'Approved', emi: 9325.5, outstanding: 185000, appliedAt: '2024-04-01T10:00:00Z', approvedAt: '2024-04-05T12:00:00Z' },
  { customer: 1, account: 2, type: 'Home', principal: 1500000, interestRate: 8.75, tenureMonths: 180, status: 'Pending', emi: null, outstanding: 1500000, appliedAt: '2024-06-10T09:00:00Z', approvedAt: null },
  { customer: 3, account: 4, type: 'Car', principal: 500000, interestRate: 9.5, tenureMonths: 60, status: 'Pending', emi: null, outstanding: 500000, appliedAt: '2024-07-01T10:00:00Z', approvedAt: null }
];

// account: index into `accounts`
const transactions = [
  { account: 0, type: 'Credit', amount: 5000, description: 'Salary Credit', balanceAfter: 45000.5, timestamp: '2024-05-01T09:00:00Z' },
  { account: 0, type: 'Debit', amount: 1500, description: 'ATM Withdrawal', balanceAfter: 43500.5, timestamp: '2024-05-03T14:30:00Z' },
  { account: 2, type: 'Credit', amount: 10000, description: 'UPI Transfer from friend', balanceAfter: 78500.75, timestamp: '2024-05-10T11:20:00Z' },
  { account: 1, type: 'Debit', amount: 25000, description: 'Online Purchase', balanceAfter: 120000, timestamp: '2024-05-12T16:45:00Z' },
  { account: 4, type: 'Credit', amount: 15000, description: 'Salary Credit', balanceAfter: 92000, timestamp: '2024-06-01T09:00:00Z' },
  { account: 5, type: 'Credit', amount: 50000, description: 'Business Income', balanceAfter: 250000, timestamp: '2024-06-05T10:30:00Z' },
  { account: 3, type: 'Debit', amount: 2000, description: 'Utility Bill', balanceAfter: 13000, timestamp: '2024-06-08T12:00:00Z' },
  { account: 0, type: 'Credit', amount: 3000, description: 'Refund', balanceAfter: 46500.5, timestamp: '2024-06-15T15:00:00Z' }
];

async function seed() {
  await connectDB();
  const managerEmail = String(process.env.SEED_MANAGER_EMAIL || '').trim().toLowerCase();
  const managerPassword = process.env.SEED_MANAGER_PASSWORD;
  if (!managerEmail || !managerPassword || managerPassword.length < 12) throw new Error('SEED_MANAGER_EMAIL and SEED_MANAGER_PASSWORD (at least 12 characters) are required.');
  await userRepository.upsertManager({ name: process.env.SEED_MANAGER_NAME || 'Bank Manager', email: managerEmail, passwordHash: await hashPassword(managerPassword) });

  await Promise.all([
    Customer.deleteMany({}),
    Account.deleteMany({}),
    Loan.deleteMany({}),
    Transaction.deleteMany({}),
    Counter.deleteMany({})
  ]);

  const customerDocs = await Customer.insertMany(customers);

  const accountDocs = await Account.insertMany(
    accounts.map(({ customer, ...a }, i) => ({
      ...a,
      customerId: customerDocs[customer]._id,
      accountNumber: `ACC${String(i + 1).padStart(6, '0')}`
    }))
  );

  await Loan.insertMany(
    loans.map(({ customer, account, ...l }, i) => ({
      ...l,
      customerId: customerDocs[customer]._id,
      accountId: accountDocs[account]._id,
      loanNumber: `LN${String(i + 1).padStart(6, '0')}`
    }))
  );

  await Transaction.insertMany(
    transactions.map(({ account, ...t }) => ({
      ...t,
      accountId: accountDocs[account]._id
    }))
  );

  await Counter.insertMany([
    { _id: 'account', seq: accounts.length },
    { _id: 'loan', seq: loans.length }
  ]);

  console.log(
    `Seeded ${customers.length} customers, ${accounts.length} accounts, ` +
      `${loans.length} loans and ${transactions.length} transactions.`
  );
}

seed()
  .catch((err) => {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
