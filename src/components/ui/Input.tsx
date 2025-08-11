import React from 'react'
export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={[
      "w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-900",
      "shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200",
      props.className || "",
    ].join(" ")} />
)