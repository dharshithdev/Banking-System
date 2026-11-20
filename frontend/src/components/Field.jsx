import { cloneElement, useId } from 'react';

const inputClasses =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20 disabled:bg-slate-100';

export function Field({ label, hint, error, id, children }) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const errorId = `${fieldId}-error`;
  const control = cloneElement(children, {
    id: children.props.id || fieldId,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': error ? errorId : children.props['aria-describedby'],
    className: `${children.props.className || ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`.trim()
  });
  return (
    <div className="block">
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {control}
      {error && <span id={errorId} role="alert" className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </div>
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
