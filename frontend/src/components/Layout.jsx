import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Icon from './Icon';
const ITEMS = [
  { to: '/customers', label: 'Customers', icon: 'users' },
  { to: '/accounts', label: 'Accounts', icon: 'card' },
  { to: '/loans', label: 'Loans', icon: 'banknotes' },
  { to: '/transactions', label: 'Transactions', icon: 'swap' }
];
function Brand() { return <div className="flex items-center gap-3 px-6 py-6"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500/15 text-gold-400 ring-1 ring-gold-500/30"><Icon name="bank" className="h-6 w-6" /></span><div><p className="text-base font-semibold leading-tight text-white">Bank Manager</p><p className="text-xs uppercase tracking-widest text-navy-300">Dashboard</p></div></div>; }
function Nav({ onNavigate }) { return <nav className="flex-1 space-y-1 px-3">{ITEMS.map((item) => <NavLink key={item.to} to={item.to} onClick={onNavigate} className={({ isActive }) => `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-white/10 text-white' : 'text-navy-200 hover:bg-white/5 hover:text-white'}`}><Icon name={item.icon} className="h-5 w-5" />{item.label}</NavLink>)}</nav>; }
export default function Layout({ onLogout }) {
  const [open, setOpen] = useState(false);
  return <div className="min-h-screen bg-slate-100">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-navy-900 lg:flex"><Brand /><Nav /><button type="button" onClick={onLogout} className="mx-6 mb-5 text-left text-xs text-navy-300 hover:text-white">Sign out</button><p className="px-6 py-5 text-xs text-navy-400">Bank Manager Console</p></aside>
    {open && <div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-navy-950/60" onClick={() => setOpen(false)} /><aside className="relative flex h-full w-64 flex-col bg-navy-900"><Brand /><Nav onNavigate={() => setOpen(false)} /></aside></div>}
    <div className="lg:pl-64"><header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden"><button type="button" onClick={() => setOpen(true)} aria-label="Open navigation" className="rounded-lg p-1.5 text-slate-600"><Icon name="menu" /></button><span className="flex-1 font-semibold text-navy-900">Bank Manager Dashboard</span><button type="button" onClick={onLogout} className="text-sm text-slate-600">Sign out</button></header><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><Outlet /></main></div>
  </div>;
}
