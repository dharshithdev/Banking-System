const inputClasses =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20 disabled:bg-slate-100';

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function Input(props) {
  return <input className={inputClasses} {...props} />;
}

export function Textarea(props) {
  return <textarea className={inputClasses} rows={3} {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select className={inputClasses} {...props}>
      {children}
    </select>
  );
}
