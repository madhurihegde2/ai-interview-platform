const FIELD =
  "block w-full rounded-lg border-0 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:opacity-60 dark:bg-slate-900 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500";

export function Label({ htmlFor, optional, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
    >
      {children}
      {optional && (
        <span className="ml-1 font-normal text-slate-400">({optional})</span>
      )}
    </label>
  );
}

export function Input({ className = "", invalid, ...props }) {
  return (
    <input
      className={`${FIELD} ${invalid ? "ring-red-400 focus:ring-red-500 dark:ring-red-500/60" : ""} ${className}`}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return <textarea className={`${FIELD} resize-y ${className}`} {...props} />;
}

export function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{children}</p>;
}
