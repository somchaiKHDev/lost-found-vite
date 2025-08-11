import React, { useEffect } from 'react'
import type { Item } from '../types'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'

export const DetailsDrawer: React.FC<{ item: Item; onClose: () => void; onEditRequest?: (item: Item) => void }> = ({ item, onClose, onEditRequest }) => {
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
      <aside className="absolute right-0 top-0 h-full w-full md:w-[480px] bg-white shadow-xl border-l border-slate-200 grid grid-rows-[auto,1fr]">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-3">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-slate-900">{item.title}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <Badge>{item.category}</Badge>
              {item.status === 'FOUND' && <Badge tone="warning">FOUND</Badge>}
              {item.status === 'STORED' && <Badge tone="info">STORED</Badge>}
              {item.status === 'CLAIMED' && <Badge tone="success">CLAIMED</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onEditRequest && onEditRequest(item)}>แก้ไข</Button>
            <Button variant="ghost" onClick={onClose}>ปิด</Button>
          </div>
        </div>
        <div className="overflow-y-auto p-4 grid gap-3">
          {item.imageUrl && (<img src={item.imageUrl} alt={item.title} className="w-full rounded-2xl object-cover" />)}
          {item.description && (<p className="whitespace-pre-wrap text-sm text-slate-700">{item.description}</p>)}
          <div className="text-sm text-slate-700">พบเมื่อ {item.dateFound} บริเวณ {item.locationFound}</div>
          <div className="text-sm text-slate-700">จุดเก็บ/รับของ: <span className="font-medium text-slate-900">{item.storageLocation}</span>{item.shelfCode && <span className="text-slate-500"> (ชั้น/ช่อง: {item.shelfCode})</span>}</div>
          <div className="text-xs text-slate-500">บันทึกโดย: {item.reporter}</div>
          {item.finderName && (
            <div className="rounded-2xl bg-slate-50 p-3 text-slate-700">
              <div className="font-medium text-slate-900">ข้อมูลผู้พบ (ส่งคืน)</div>
              <div>ชื่อ: {item.finderName}{item.finderContact ? ` • ติดต่อ: ${item.finderContact}` : ''}</div>
              {item.finderNote && <div>หมายเหตุ: {item.finderNote}</div>}
              {item.dateHandover && <div>วันที่รับมอบ: {item.dateHandover}</div>}
            </div>
          )}
          {item.status === 'STORED' && item.dateStored && (<div className="text-sky-700 text-sm">เก็บเข้าคลังเมื่อ {item.dateStored} โดย {item.storedBy || '-'}</div>)}
          {item.status === 'CLAIMED' && (<div className="text-emerald-700 text-sm">รับคืนโดย {item.claimer} เมื่อ {item.dateClaimed}</div>)}
        </div>
      </aside>
    </div>
  )
}
