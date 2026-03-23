import React from 'react';

export function Field({ label, required, error, children }) {
  return (
    <div className="field">
      {label && (
        <label className="label">
          {label}
          {required && <span className="field-required">*</span>}
        </label>
      )}
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function Input({ className = '', ...props }) {
  return <input className={`input ${className}`.trim()} {...props} />;
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`input textarea ${className}`.trim()}
      {...props}
    />
  );
}

export function Select({ options = [], className = '', placeholder, ...props }) {
  return (
    <select className={`input select ${className}`.trim()} {...props}>
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
