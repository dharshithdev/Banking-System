export const ACCOUNT_TYPES = ['Savings', 'Current', 'Fixed Deposit'];
export const LOAN_TYPES = ['Personal', 'Home', 'Car', 'Education'];
export const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[\p{L} .-]+$/u;
const PHONE_PATTERN = /^\+?[0-9]{10,15}$/;
const CURRENCY_PATTERN = /^\d+(?:\.\d{1,2})?$/;

export const isValidObjectId = (value) => typeof value === 'string' && OBJECT_ID_PATTERN.test(value);
export const normalizeEmail = (value) => String(value ?? '').trim().toLowerCase();
export const normalizePhone = (value) => String(value ?? '').replace(/[\s-]/g, '');
export const normalizeCurrency = (value) => String(value ?? '').trim();

export function validateCustomerField(field, value) {
  const text = String(value ?? '').trim();
  if (field === 'name') {
    if (!text) return 'Name is required.';
    if (text.length < 2 || text.length > 80) return 'Name must be 2–80 characters.';
    if (!NAME_PATTERN.test(text)) return 'Use letters, spaces, periods, or hyphens only.';
  }
  if (field === 'email') {
    const email = normalizeEmail(value);
    if (!email) return 'Email is required.';
    if (email.length > 120) return 'Email must be 120 characters or fewer.';
    if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.';
  }
  if (field === 'phone') {
    const phone = normalizePhone(value);
    if (!phone) return 'Phone is required.';
    if (!PHONE_PATTERN.test(phone)) return 'Enter 10–15 digits, optionally starting with +.';
    const digits = phone.replace(/^\+/, '');
    if (/^(\d)\1+$/.test(digits)) return 'Enter a real phone number, not repeated digits.';
  }
  if (field === 'address') {
    if (!text) return 'Address is required.';
    if (text.length < 5 || text.length > 200) return 'Address must be 5–200 characters.';
  }
  return '';
}

export function validateCustomer(values) {
  return Object.fromEntries(['name', 'email', 'phone', 'address']
    .map((field) => [field, validateCustomerField(field, values[field])]).filter(([, error]) => error));
}

export function validateAccountField(field, value) {
  if (field === 'customerId') {
    if (!value) return 'Select a customer.';
    if (!isValidObjectId(value)) return 'Select a valid customer.';
  }
  if (field === 'type' && !ACCOUNT_TYPES.includes(value)) return 'Choose a valid account type.';
  if (field === 'balance') {
    const raw = normalizeCurrency(value);
    if (!raw) return 'Initial deposit is required.';
    if (!CURRENCY_PATTERN.test(raw) || !Number.isFinite(Number(raw))) return 'Enter a valid amount with up to 2 decimal places.';
    const amount = Number(raw);
    if (amount < 0) return 'Initial deposit cannot be negative.';
    if (amount > 100_000_000) return 'Initial deposit cannot exceed ₹100,000,000.';
  }
  return '';
}

export function validateAmountField(field, value, { mode, balance } = {}) {
  if (field === 'amount') {
    const raw = normalizeCurrency(value);
    if (!raw) return 'Amount is required.';
    if (!CURRENCY_PATTERN.test(raw) || !Number.isFinite(Number(raw))) return 'Enter a valid amount with up to 2 decimal places.';
    const amount = Number(raw);
    if (amount <= 0) return 'Amount must be greater than 0.';
    if (amount > 10_000_000) return 'Amount cannot exceed ₹10,000,000.';
    if (mode === 'withdraw' && amount > balance) {
      const available = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(balance);
      return `Amount exceeds available balance (${available}).`;
    }
  }
  if (field === 'description' && String(value ?? '').trim().length > 140) return 'Description must be 140 characters or fewer.';
  return '';
}

export function validateLoanField(field, value, values = {}, { accounts = [] } = {}) {
  if (field === 'customerId') {
    if (!value) return 'Select a customer.';
    if (!isValidObjectId(value)) return 'Select a valid customer.';
  }
  if (field === 'accountId' && value) {
    if (!isValidObjectId(value)) return 'Select a valid account.';
    if (!accounts.some((account) => account.id === value && account.customerId === values.customerId)) return 'Choose an account belonging to the selected customer.';
  }
  if (field === 'type' && !LOAN_TYPES.includes(value)) return 'Choose a valid loan type.';
  if (field === 'principal') {
    const raw = normalizeCurrency(value);
    if (!raw) return 'Principal is required.';
    if (!CURRENCY_PATTERN.test(raw) || !Number.isFinite(Number(raw))) return 'Enter a valid principal with up to 2 decimal places.';
    if (Number(raw) < 1000) return 'Principal must be at least ₹1,000.';
    if (Number(raw) > 50_000_000) return 'Principal cannot exceed ₹50,000,000.';
  }
  if (field === 'interestRate') {
    const raw = String(value ?? '').trim();
    if (!raw) return 'Interest rate is required.';
    if (!/^\d+(?:\.\d+)?$/.test(raw) || !Number.isFinite(Number(raw))) return 'Enter a valid annual interest rate.';
    if (Number(raw) < 0 || Number(raw) > 50) return 'Interest rate must be between 0% and 50%.';
  }
  if (field === 'tenureMonths') {
    const raw = String(value ?? '').trim();
    if (!raw) return 'Tenure is required.';
    if (!/^\d+$/.test(raw) || !Number.isInteger(Number(raw))) return 'Tenure must be a whole number of months.';
    if (Number(raw) < 1 || Number(raw) > 360) return 'Tenure must be between 1 and 360 months.';
  }
  return '';
}

export function validateLoan(values, accounts) {
  return Object.fromEntries(['customerId', 'accountId', 'type', 'principal', 'interestRate', 'tenureMonths']
    .map((field) => [field, validateLoanField(field, values[field], values, { accounts })]).filter(([, error]) => error));
}

export function validateLoginField(field, value) {
  const text = String(value ?? '').trim();
  if (field === 'email') {
    if (!text) return 'Email is required.';
    if (text.length > 120 || !EMAIL_PATTERN.test(normalizeEmail(text))) return 'Enter a valid email address.';
  }
  if (field === 'password') {
    if (!value) return 'Password is required.';
    if (String(value).length < 6) return 'Password must be at least 6 characters.';
  }
  return '';
}

export function validateResetOtp(value) {
  if (!String(value ?? '')) return 'Reset code is required.';
  return /^\d{6}$/.test(String(value)) ? '' : 'Enter the 6-digit reset code.';
}

export function validatePasswordStrength(value) {
  const password = String(value ?? '');
  if (!password) return 'New password is required.';
  if (password.length < 8) return 'Use at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Add at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Add at least one lowercase letter.';
  if (!/[\d\W]/.test(password)) return 'Add at least one number or special character.';
  return '';
}

export function calculateEmi(principal, annualRate, tenureMonths) {
  if (!Number.isFinite(principal) || principal <= 0 || !Number.isFinite(annualRate) || annualRate < 0 || !Number.isInteger(tenureMonths) || tenureMonths < 1) return null;
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return Math.round((principal / tenureMonths) * 100) / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  return Math.round((principal * monthlyRate * factor / (factor - 1)) * 100) / 100;
}
