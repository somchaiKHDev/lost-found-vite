import React, { useState } from 'react'
import type { Item } from '../types'
import { Button } from './ui/Button'
import { Field } from './ui/Field'
import { Input } from './ui/Input'
import { Badge } from './ui/Badge'

export const ItemCard: React.FC<{ item: Item; onClaim: (id: string, claimer: string) => void; onDelete: (id: string) => void; onStore: (id: string, shelf: string, storedBy: string) => void; staffName: string; onOpenDetails: (id: string) => void; onOpenAnnPreview: (id: string) => void; onEditRequest: (item: Item) => void; annCount?: number; }>
  = ({ item, onClaim, onDelete, onStore, staffName, onOpenDetails, onOpenAnnPreview, onEditRequest, annCount = 0 }) => {
  const [who, setWho] = useState("")
  const [shelf, setShelf] = useState(item.shelfCode || "")

  return (
    <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900">{item.title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <Badge>{item.category}</Badge>
            {item.status === "FOUND" && <Badge tone="warning">FOUND</Badge>}
            {item.status === "STORED" && <Badge tone="info">STORED</Badge>}
            {item.status === "CLAIMED" && <Badge tone="success">CLAIMED</Badge>}
            <span>พบเมื่อ {item.dateFound}</span>
            <span>ที่ {item.locationFound}</span>
            {item.finderName && <Badge tone="info">รับมอบจากผู้พบ</Badge>}
            {annCount > 0 && (
              <button type="button" onClick={() => onOpenAnnPreview(item.id)}
                title={annCount === 1 ? 'มีประกาศแล้ว' : `มีประกาศแล้ว (${annCount})`}
                aria-label={annCount === 1 ? 'เปิดพรีวิวประกาศล่าสุด' : `เปิดพรีวิวประกาศล่าสุด (${annCount})`}
                className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800 ring-1 ring-sky-200 hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
                <span aria-hidden>📜</span><span>ประกาศแล้ว{annCount > 1 ? ` (${annCount})` : ''}</span>
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => onOpenDetails(item.id)}>ดูรายละเอียด</Button>
          <Button variant="ghost" onClick={() => onEditRequest(item)}>แก้ไข</Button>
          <Button variant="danger" onClick={() => onDelete(item.id)}>ลบ</Button>
        </div>
      </div>

      {item.status === "FOUND" && (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-2 rounded-2xl border border-slate-200 p-3">
            <div className="text-sm font-semibold text-slate-900">📦 เก็บเข้าคลัง</div>
            <Field label="ชั้น/ช่อง (Shelf Code)" hint="เช่น A-2-03">
              <Input value={shelf} onChange={(e) => setShelf(e.target.value)} placeholder="A-2-03" />
            </Field>
            <div className="flex items-center gap-2">
              <Button onClick={() => shelf.trim() && onStore(item.id, shelf.trim(), staffName || "staff")} disabled={!shelf.trim()}>บันทึกว่าเก็บเข้าคลังแล้ว</Button>
            </div>
          </div>
          <div className="grid gap-2 rounded-2xl border border-slate-200 p-3">
            <div className="text-sm font-semibold text-slate-900">✅ บันทึกการรับคืน</div>
            <Field label="ชื่อผู้มารับคืน" hint="ยืนยันตัวตนตามขั้นตอนของหน่วยงานก่อนบันทึก">
              <Input value={who} onChange={(e) => setWho(e.target.value)} placeholder="ชื่อ-นามสกุล" />
            </Field>
            <div className="flex items-center gap-2">
              <Button onClick={() => who.trim() && onClaim(item.id, who.trim())} disabled={!who.trim()}>บันทึกการรับคืน</Button>
            </div>
          </div>
        </div>
      )}

      {item.status === "STORED" && (
        <div className="grid gap-2 rounded-2xl border border-slate-200 p-3">
          <div className="text-sm font-semibold text-slate-900">✅ บันทึกการรับคืน</div>
          <Field label="ชื่อผู้มารับคืน" hint="ยืนยันตัวตนตามขั้นตอนของหน่วยงานก่อนบันทึก">
            <Input value={who} onChange={(e) => setWho(e.target.value)} placeholder="ชื่อ-นามสกุล" />
          </Field>
          <div className="flex items-center gap-2">
            <Button onClick={() => who.trim() && onClaim(item.id, who.trim())} disabled={!who.trim()}>บันทึกการรับคืน</Button>
          </div>
        </div>
      )}
    </div>
  )
}
