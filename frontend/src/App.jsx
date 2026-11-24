import { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { authApi } from './api/client';
import Layout from './components/Layout';
import CustomersPage from './pages/CustomersPage';
import AccountsPage from './pages/AccountsPage';
import LoansPage from './pages/LoansPage';
import TransactionsPage from './pages/TransactionsPage';
import { Field, Input } from './components/Field';
import { normalizeEmail, validateLoginField, validateResetOtp, validatePasswordStrength } from './utils/validation';

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
  const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false);
  const [step, setStep] = useState('credentials'); const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState('');
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
    if (step === 'forgot-email') return sendResetCode();
    if (step === 'reset') return confirmReset();
    const nextErrors = Object.fromEntries(['email', 'password'].map((field) => [field, validateLoginField(field, form[field])]).filter(([, message]) => message));
    setErrors(nextErrors); setTouched({ email: true, password: true });
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) { document.getElementById(`login-${firstInvalid}`)?.focus(); return; }
    if (submitting.current) return;
    submitting.current = true; setError(''); setNotice(''); setBusy(true);
    try {
      const result = await authApi.login(normalizeEmail(form.email), form.password);
      if (result.requiresOtp) { setStep('otp'); setOtp(''); setNotice(`A 6-digit verification code was sent to ${result.email}.`); }
      else onLogin(result.user);
    }
    catch (err) { setError(err.message); }
    finally { submitting.current = false; setBusy(false); }
  }
  async function verify(event) {
    event.preventDefault(); setError(''); setNotice('');
    if (!/^\d{6}$/.test(otp)) { setError('Enter the 6-digit verification code.'); return; }
    setBusy(true);
    try { onLogin((await authApi.verifyLoginOtp(normalizeEmail(form.email), otp)).user); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function resend() {
    setError(''); setNotice(''); setBusy(true);
    try { const result = await authApi.resendLoginOtp(normalizeEmail(form.email)); setNotice(result.message); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function sendResetCode() {
    const emailError = validateLoginField('email', form.email);
    setErrors(emailError ? { email: emailError } : {}); setTouched({ email: true });
    if (emailError) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await authApi.requestPasswordReset(normalizeEmail(form.email));
      setStep('reset'); setOtp(''); setNewPassword(''); setConfirmPassword(''); setErrors({});
      setNotice(result.message);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function confirmReset() {
    const nextErrors = {
      otp: validateResetOtp(otp),
      newPassword: validatePasswordStrength(newPassword),
      confirmPassword: confirmPassword === newPassword ? '' : 'Passwords do not match.'
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await authApi.confirmPasswordReset({ email: normalizeEmail(form.email), otp, newPassword });
      setStep('credentials'); setForm((current) => ({ ...current, password: '' }));
      setOtp(''); setNewPassword(''); setConfirmPassword(''); setErrors({});
      setNotice('Password updated. Sign in with your new password.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  function backToSignIn() { setStep('credentials'); setOtp(''); setNewPassword(''); setConfirmPassword(''); setError(''); setNotice(''); setErrors({}); }
  const startForgotPassword = () => { setStep('forgot-email'); setError(''); setNotice(''); setErrors({}); setTouched({}); };
  const resetField = (field, value, setter, validation) => {
    setter(value);
    if (errors[field]) setErrors((current) => ({ ...current, [field]: validation(value) }));
    setError('');
  };
  return <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
    <form noValidate onSubmit={step === 'credentials' || step === 'otp' ? (step === 'credentials' ? submit : verify) : submit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <p className="text-sm font-semibold uppercase tracking-widest text-navy-700">Bank Manager</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{{ credentials: 'Sign in', otp: '2FA Verification', 'forgot-email': 'Reset your password', reset: 'Choose a new password' }[step]}</h1>
      <p className="mt-2 text-sm text-slate-500">{step === 'credentials' ? 'Use your manager credentials to continue.' : step === 'otp' ? `Enter the 6-digit code sent to ${normalizeEmail(form.email)}.` : step === 'forgot-email' ? 'Enter the email address associated with your manager account.' : `Enter the reset code sent to ${normalizeEmail(form.email)}.`}</p>
      {['credentials', 'forgot-email'].includes(step) ? <>
        <div className="mt-6"><Field label="Email ID" id="login-email" error={errors.email}><Input autoComplete="username" type="email" inputMode="email" value={form.email} onChange={update('email')} onBlur={blur('email')} /></Field></div>
        {step === 'credentials' && <div className="mt-4"><Field label={<span className="flex items-center justify-between">Password <button type="button" onClick={startForgotPassword} className="font-medium text-navy-700 hover:underline">Forgot password?</button></span>} id="login-password" error={errors.password}><Input autoComplete="current-password" type="password" value={form.password} onChange={update('password')} onBlur={blur('password')} /></Field></div>}
      </> : step === 'otp' ? <div className="mt-6"><Field label="6-digit verification code" id="login-otp" error={/^\d{6}$/.test(otp) || !otp ? '' : 'Enter 6 digits'}><Input autoComplete="one-time-code" inputMode="numeric" type="text" maxLength={6} value={otp} onChange={(event) => { setOtp(event.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }} /></Field></div> : <div className="mt-6 space-y-4">
        <Field label="6-digit reset code" id="reset-otp" error={errors.otp}><Input autoComplete="one-time-code" inputMode="numeric" type="text" maxLength={6} value={otp} onChange={(event) => resetField('otp', event.target.value.replace(/\D/g, '').slice(0, 6), setOtp, validateResetOtp)} /></Field>
        <Field label="New Password" id="reset-password" error={errors.newPassword} hint="At least 8 characters with uppercase, lowercase, and a number or special character."><Input autoComplete="new-password" type="password" value={newPassword} onChange={(event) => resetField('newPassword', event.target.value, setNewPassword, validatePasswordStrength)} /></Field>
        <Field label="Confirm New Password" id="reset-confirm" error={errors.confirmPassword}><Input autoComplete="new-password" type="password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setErrors((current) => ({ ...current, confirmPassword: event.target.value === newPassword ? '' : 'Passwords do not match.' })); }} /></Field>
      </div>}
      {notice && <p role="status" className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">{notice}</p>}
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="mt-6 w-full rounded-lg bg-navy-800 px-4 py-2.5 font-semibold text-white disabled:opacity-60">{busy ? (step === 'credentials' ? 'Signing in…' : step === 'otp' ? 'Verifying…' : 'Please wait…') : ({ credentials: 'Sign in', otp: 'Verify & Sign In', 'forgot-email': 'Send Reset Code', reset: 'Reset Password' }[step])}</button>
      {step === 'otp' && <div className="mt-4 flex items-center justify-between text-sm"><button type="button" disabled={busy} onClick={resend} className="font-semibold text-navy-700 hover:underline">Resend Code</button><button type="button" disabled={busy} onClick={backToSignIn} className="text-slate-600 hover:underline">Back to Sign In</button></div>}
      {step === 'reset' && <div className="mt-4 flex items-center justify-between text-sm"><button type="button" disabled={busy} onClick={sendResetCode} className="font-semibold text-navy-700 hover:underline">Resend Code</button><button type="button" disabled={busy} onClick={backToSignIn} className="text-slate-600 hover:underline">Back to Sign In</button></div>}
      {step === 'forgot-email' && <div className="mt-4 text-right text-sm"><button type="button" onClick={backToSignIn} className="text-slate-600 hover:underline">Back to Sign In</button></div>}
    </form>
  </main>;
}
