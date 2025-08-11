import React from 'react'
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }>
  = ({ variant = "primary", className, ...rest }) => (
  <button {...rest} className={[
      "rounded-2xl px-4 py-2 text-sm font-semibold",
      "transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300",
      variant === "primary" && "bg-slate-900 text-white hover:bg-slate-800",
      variant === "ghost" && "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200",
      variant === "danger" && "bg-rose-600 text-white hover:bg-rose-500",
      className || "",
    ].join(" ")} />
)