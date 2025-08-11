import React, { useEffect } from 'react'
import type { Announcement, Item } from '../../types'
import { Button } from '../ui/Button'

export const AnnouncementPreview: React.FC<{ ann: Announcement; item?: Item | null; onClose: () => void }> = ({ ann, item, onClose }) => {
  useEffect(() => {
    const root = document.documentElement; const body = document.body
    const prevOverflowRoot = root.style.overflow; const prevOverflowBody = body.style.overflow; const prevPaddingRight = body.style.paddingRight
    const sbw = window.innerWidth - document.documentElement.clientWidth
    root.style.overflow = 'hidden'; body.style.overflow = 'hidden'; if (sbw > 0) body.style.paddingRight = sbw + 'px'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { root.style.overflow = prevOverflowRoot; body.style.overflow = prevOverflowBody; body.style.paddingRight = prevPaddingRight; window.removeEventListener('keydown', onKey) }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 p-3">
            <div className="text-base font-semibold text-slate-900 truncate">พรีวิวใบประกาศ</div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => window.print()}>พิมพ์</Button>
              <Button variant="danger" onClick={onClose}>ปิด</Button>
            </div>
          </div>
          <div className="p-6">
            <div className="text-center">
              <div className="text-2xl font-extrabold tracking-wide text-slate-900">ใบประกาศ</div>
              <div className="mt-1 text-xs text-slate-500">Lost & Found • Staff</div>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="text-xl font-semibold text-slate-900">{ann.title}</div>
              {item && (<div className="text-sm text-slate-700">อ้างอิงสิ่งของ: {item.title} • พบเมื่อ {item.dateFound} บริเวณ {item.locationFound}</div>)}
              <div className="rounded-2xl bg-slate-50 p-4 text-slate-800 whitespace-pre-wrap leading-relaxed">{ann.body}</div>
              <div className="text-xs text-slate-500">เผยแพร่เมื่อ {new Date(ann.createdAt).toLocaleString()} โดย {ann.createdBy}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
