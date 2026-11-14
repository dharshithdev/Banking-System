const TONES = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  credit: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  inactive: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  closed: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  rejected: 'bg-red-50 text-red-700 ring-red-600/20',
  debit: 'bg-red-50 text-red-700 ring-red-600/20'
};

export default function Badge({ value }) {
  const tone = TONES[String(value).toLowerCase()] || 'bg-slate-100 text-slate-600 ring-slate-500/20';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}
    >
      {value}
    </span>
  );
}
