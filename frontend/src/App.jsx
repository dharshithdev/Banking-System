import { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { authApi } from './api/client';
import Layout from './components/Layout';
import CustomersPage from './pages/CustomersPage';
import AccountsPage from './pages/AccountsPage';
import LoansPage from './pages/LoansPage';
import TransactionsPage from './pages/TransactionsPage';
import { Field, Input } from './components/Field';
import { normalizeEmail, validateLoginField } from './utils/validation';

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    const clear = () => { setUser(null); setChecking(false); };
    window.addEventListener('bank-manager-unauthorized', clear);
    authApi.me().then((result) => setUser(result.user)).catch(() => setUser(null)).finally(() => setChecking(false));
    return () => window.removeEventListener('bank-manager-unauthorized', clear);
  }, []);
  if (checking) return <main className="flex min-h-screen items-center justify-center text-slate-500">Loading…</main>;
  if (!user) return <LoginScreen onLogin={setUser} />;
  const logout = async () => { try { await authApi.logout(); } finally { setUser(null); } };
  return <Routes><Route element={<Layout onLogout={logout} />}>
    <Route index element={<Navigate to="/customers" replace />} />
    <Route path="/customers" element={<CustomersPage />} />
    <Route path="/accounts" element={<AccountsPage />} />
    <Route path="/loans" element={<LoansPage />} />
    <Route path="/transactions" element={<TransactionsPage />} />
    <Route path="*" element={<Navigate to="/customers" replace />} />
  </Route></Routes>;
}

function LoginScreen({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({}); const [touched, setTouched] = useState({});
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  function update(field) {
    return (event) => {
      const value = event.target.value;
      setForm((current) => ({ ...current, [field]: value })); setError('');
      if (touched[field] || errors[field]) setErrors((current) => ({ ...current, [field]: validateLoginField(field, value) }));
    };
  }
  function blur(field) {
    return () => { setTouched((current) => ({ ...current, [field]: true })); setErrors((current) => ({ ...current, [field]: validateLoginField(field, form[field]) })); };
  }
  async function submit(event) {
    event.preventDefault();
    const nextErrors = Object.fromEntries(['email', 'password'].map((field) => [field, validateLoginField(field, form[field])]).filter(([, message]) => message));
    setErrors(nextErrors); setTouched({ email: true, password: true });
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) { document.getElementById(`login-${firstInvalid}`)?.focus(); return; }
    if (submitting.current) return;
    submitting.current = true; setError(''); setBusy(true);
    try { onLogin((await authApi.login(normalizeEmail(form.email), form.password)).user); }
    catch (err) { setError(err.message); }
    finally { submitting.current = false; setBusy(false); }
  }
  return <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
    <form noValidate onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <p className="text-sm font-semibold uppercase tracking-widest text-navy-700">Bank Manager</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Sign in</h1>
      <p className="mt-2 text-sm text-slate-500">Use your manager credentials to continue.</p>
      <div className="mt-6"><Field label="Email" id="login-email" error={errors.email}><Input autoComplete="username" type="email" inputMode="email" value={form.email} onChange={update('email')} onBlur={blur('email')} /></Field></div>
      <div className="mt-4"><Field label="Password" id="login-password" error={errors.password}><Input autoComplete="current-password" type="password" value={form.password} onChange={update('password')} onBlur={blur('password')} /></Field></div>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="mt-6 w-full rounded-lg bg-navy-800 px-4 py-2.5 font-semibold text-white disabled:opacity-60">{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  </main>;
}
