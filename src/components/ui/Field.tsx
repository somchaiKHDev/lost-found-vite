import React from 'react'

export const Field: React.FC<{ label: string; required?: boolean; hint?: string; children: React.ReactNode }>
  = ({ label, required, hint, children }) => (
  <label className="grid gap-1">
    <span className="text-sm font-medium text-slate-700">
      {label} {required && <span className="text-rose-600">*</span>}
    </span>
    {children}
    {hint && <span className="text-xs text-slate-500">{hint}</span>}
  </label>
)
