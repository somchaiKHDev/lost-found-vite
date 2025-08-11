import React from 'react'

export const Badge: React.FC<{ children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "info" }>
  = ({ children, tone = "neutral" }) => (
  <span className={[
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
      tone === "success" && "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
      tone === "warning" && "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
      tone === "neutral" && "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200",
      tone === "info" && "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
    ].filter(Boolean).join(" ")}>
    {children}
  </span>
)
