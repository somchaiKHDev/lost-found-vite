import React, { useMemo, useState } from 'react'
import type { Item, Status } from '../types'
import { Input } from './ui/Input'
import { ItemCard } from './ItemCard'

export const ListAndFilters: React.FC<{
  items: Item[];
  onClaim: (id: string, who: string) => void;
  onDelete: (id: string) => void;
  onStore: (id: string, shelf: string, storedBy: string) => void;
  staffName: string;
  onOpenDetails: (id: string) => void;
  onOpenAnnPreview: (id: string) => void;
  annCounts: Record<string, number>;
  onEditRequest: (item: Item) => void;
}> = ({ items, onClaim, onDelete, onStore, staffName, onOpenDetails, onOpenAnnPreview, annCounts, onEditRequest }) => {
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<"ALL" | Status>("ALL")
  const [category, setCategory] = useState<string>("ALL")
  const [sort, setSort] = useState<"NEWEST" | "OLDEST">("NEWEST")

  const categories = useMemo(() => {
    const set = new Set(items.map(i => i.category).filter(Boolean))
    return ["ALL", ...Array.from(set)]
  }, [items])

  const filtered = useMemo(() => {
    const base = items.filter(i => {
      const hitQ = q.trim() ? [i.title, i.description, i.locationFound, i.storageLocation, i.category].join(" ").toLowerCase().includes(q.toLowerCase()) : true
      const hitS = status === "ALL" ? true : i.status === status
      const hitC = category === "ALL" ? true : i.category === category
      return hitQ && hitS && hitC
    })
    const sorted = base.sort((a, b) => (sort === "NEWEST" ? b.dateFound.localeCompare(a.dateFound) : a.dateFound.localeCompare(b.dateFound)))
    return sorted
  }, [items, q, status, category, sort])

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
        <Input placeholder="ค้นหา… (ชื่อ, รายละเอียด, สถานที่)" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm">
          <option value="ALL">สถานะ: ทั้งหมด</option>
          <option value="FOUND">FOUND</option>
          <option value="STORED">STORED</option>
          <option value="CLAIMED">CLAIMED</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm">
          {categories.map((c) => (<option key={c} value={c}>{c === "ALL" ? "หมวดหมู่: ทั้งหมด" : c}</option>))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm">
          <option value="NEWEST">เรียง: ใหม่ → เก่า</option>
          <option value="OLDEST">เรียง: เก่า → ใหม่</option>
        </select>
        <div className="text-sm text-slate-600 self-center">ทั้งหมด {filtered.length} รายการ</div>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-600">ไม่มีข้อมูลที่ตรงกับการค้นหา/ตัวกรอง</div>
        ) : (
          filtered.map((it) => (
            <ItemCard key={it.id} item={it} onClaim={onClaim} onDelete={onDelete} onStore={onStore} staffName={staffName} onOpenDetails={onOpenDetails} onOpenAnnPreview={onOpenAnnPreview} onEditRequest={onEditRequest} annCount={annCounts[it.id] || 0} />
          ))
        )}
      </div>
    </div>
  )
}
