import React, { useEffect, useState } from 'react'
import type { Item, Status } from '../../types'
import { Field } from '../ui/Field'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'

type Props = {
  item: Item
  onClose: () => void
  onSave: (updated: Item) => void
}

export default function EditItemModal({ item, onClose, onSave }: Props){
  const [form, setForm] = useState<Item>({ ...item })
  const set = <K extends keyof Item>(k: K, v: Item[K]) => setForm(prev => ({ ...prev, [k]: v }))

  useEffect(() => {
    const root = document.documentElement; const body = document.body
    const prevOverflowRoot = root.style.overflow; const prevOverflowBody = body.style.overflow; const prevPaddingRight = body.style.paddingRight
    const sbw = window.innerWidth - document.documentElement.clientWidth
    root.style.overflow = 'hidden'; body.style.overflow = 'hidden'; if (sbw > 0) body.style.paddingRight = sbw + 'px'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { root.style.overflow = prevOverflowRoot; body.style.overflow = prevOverflowBody; body.style.paddingRight = prevPaddingRight; window.removeEventListener('keydown', onKey) }
  }, [onClose])

  const canSave = form.title.trim() && form.locationFound.trim() && form.storageLocation.trim()

  const statusOptions: Status[] = ['FOUND','STORED','CLAIMED']

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 p-3">
            <div className="text-base font-semibold text-slate-900 truncate">แก้ไขรายการ</div>
            <div className="flex items-center gap-2">
              <Button variant="danger" onClick={onClose}>ปิด</Button>
            </div>
          </div>
          <div className="p-6 grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="ชื่อสิ่งของ" required><Input value={form.title} onChange={(e)=>set('title', e.target.value)} /></Field>
              <Field label="หมวดหมู่"><Input value={form.category} onChange={(e)=>set('category', e.target.value)} /></Field>
              <Field label="สถานที่พบ" required><Input value={form.locationFound} onChange={(e)=>set('locationFound', e.target.value)} /></Field>
              <Field label="วันที่พบ"><Input type="date" value={form.dateFound} onChange={(e)=>set('dateFound', e.target.value)} /></Field>
              <Field label="ที่เก็บ/จุดรับของ" required><Input value={form.storageLocation} onChange={(e)=>set('storageLocation', e.target.value)} /></Field>
              <Field label="ลิงก์รูป"><Input value={form.imageUrl || ''} onChange={(e)=>set('imageUrl', e.target.value)} /></Field>
            </div>

            <Field label="รายละเอียดเพิ่มเติม"><Textarea rows={3} value={form.description || ''} onChange={(e)=>set('description', e.target.value)} /></Field>

            <div className="grid gap-3 md:grid-cols-3">
              <Field label="สถานะ">
                <select value={form.status} onChange={(e)=>set('status', e.target.value as any)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm">
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="บันทึกโดย"><Input value={form.reporter} onChange={(e)=>set('reporter', e.target.value)} /></Field>
              <div className="hidden md:block" />
            </div>

            <div className="grid gap-3 rounded-2xl border border-slate-200 p-3">
              <div className="text-sm font-semibold text-slate-900">ข้อมูลผู้พบ (หากมี)</div>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="ชื่อผู้พบ"><Input value={form.finderName || ''} onChange={(e)=>set('finderName', e.target.value)} /></Field>
                <Field label="ติดต่อ"><Input value={form.finderContact || ''} onChange={(e)=>set('finderContact', e.target.value)} /></Field>
                <Field label="หมายเหตุ"><Input value={form.finderNote || ''} onChange={(e)=>set('finderNote', e.target.value)} /></Field>
                <Field label="วันที่รับมอบ"><Input type="date" value={form.dateHandover || ''} onChange={(e)=>set('dateHandover', e.target.value)} /></Field>
              </div>
            </div>

            {form.status !== 'FOUND' && (
              <div className="grid gap-3 rounded-2xl border border-slate-200 p-3">
                <div className="text-sm font-semibold text-slate-900">ข้อมูลการเก็บคลัง</div>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Shelf Code"><Input value={form.shelfCode || ''} onChange={(e)=>set('shelfCode', e.target.value)} /></Field>
                  <Field label="วันที่เก็บ"><Input type="date" value={form.dateStored || ''} onChange={(e)=>set('dateStored', e.target.value)} /></Field>
                  <Field label="ผู้เก็บ"><Input value={form.storedBy || ''} onChange={(e)=>set('storedBy', e.target.value)} /></Field>
                </div>
              </div>
            )}

            {form.status == 'CLAIMED' && (
              <div className="grid gap-3 rounded-2xl border border-slate-200 p-3">
                <div className="text-sm font-semibold text-slate-900">ข้อมูลการรับคืน</div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="ชื่อผู้รับคืน"><Input value={form.claimer || ''} onChange={(e)=>set('claimer', e.target.value)} /></Field>
                  <Field label="วันที่รับคืน"><Input type="date" value={form.dateClaimed || ''} onChange={(e)=>set('dateClaimed', e.target.value)} /></Field>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>ยกเลิก</Button>
              <Button onClick={() => canSave && onSave({ ...form })} disabled={!canSave}>บันทึกการแก้ไข</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
