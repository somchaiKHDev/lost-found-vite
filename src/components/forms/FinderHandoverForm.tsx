import React, { useState } from 'react'
import type { Item } from '../../types'
import { uid, todayISO } from '../../utils'
import { Field } from '../ui/Field'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'

export const FinderHandoverForm: React.FC<{ onAdd: (item: Item) => void; staffName: string }> = ({ onAdd, staffName }) => {
  const [finderName, setFinderName] = useState("")
  const [finderContact, setFinderContact] = useState("")
  const [finderNote, setFinderNote] = useState("")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("ทั่วไป")
  const [description, setDescription] = useState("")
  const [locationFound, setLocationFound] = useState("")
  const [dateFound, setDateFound] = useState(todayISO())
  const [storageLocation, setStorageLocation] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [storeNow, setStoreNow] = useState(true)
  const [shelfCode, setShelfCode] = useState("")

  const canSubmit = finderName.trim() && title.trim() && locationFound.trim() && storageLocation.trim()

  const submit = () => {
    if (!canSubmit) return
    const base: Item = {
      id: uid(), title: title.trim(), category: category.trim(), description: description.trim() || undefined,
      locationFound: locationFound.trim(), dateFound, storageLocation: storageLocation.trim(), reporter: staffName.trim() || "staff",
      imageUrl: imageUrl.trim() || undefined, status: storeNow ? "STORED" : "FOUND", finderName: finderName.trim(),
      finderContact: finderContact.trim() || undefined, finderNote: finderNote.trim() || undefined, dateHandover: todayISO(),
    }
    const item: Item = storeNow ? { ...base, shelfCode: shelfCode.trim() || undefined, dateStored: todayISO(), storedBy: staffName || "staff" } : base
    onAdd(item)
    setFinderName(""); setFinderContact(""); setFinderNote(""); setTitle(""); setCategory("ทั่วไป"); setDescription(""); setLocationFound(""); setDateFound(todayISO()); setStorageLocation(""); setImageUrl(""); setStoreNow(true); setShelfCode("")
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">📣 แจ้งของหาย (ผู้พบต้องการส่งคืน)</h2>
      <div className="mt-4 grid gap-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="ชื่อผู้พบ" required><Input value={finderName} onChange={(e) => setFinderName(e.target.value)} placeholder="ชื่อ-นามสกุล" /></Field>
          <Field label="ช่องทางติดต่อ" hint="เช่น เบอร์โทรหรืออีเมล"><Input value={finderContact} onChange={(e) => setFinderContact(e.target.value)} placeholder="080-xxx-xxxx / email" /></Field>
          <Field label="หมายเหตุ"><Input value={finderNote} onChange={(e) => setFinderNote(e.target.value)} placeholder="รายละเอียดเพิ่มเติม" /></Field>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="ชื่อสิ่งของ" required><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น กระเป๋าสตางค์" /></Field>
          <Field label="หมวดหมู่"><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="เช่น อิเล็กทรอนิกส์, เอกสาร" /></Field>
          <Field label="สถานที่พบ" required><Input value={locationFound} onChange={(e) => setLocationFound(e.target.value)} placeholder="บริเวณที่พบ" /></Field>
          <Field label="วันที่พบ"><Input type="date" value={dateFound} onChange={(e) => setDateFound(e.target.value)} /></Field>
          <Field label="ที่เก็บ/จุดรับของ" required><Input value={storageLocation} onChange={(e) => setStorageLocation(e.target.value)} placeholder="ห้องธุรการ ชั้น 2" /></Field>
          <Field label="ลิงก์รูป (ถ้ามี)"><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" /></Field>
          <div className="md:col-span-2"><Field label="รายละเอียดเพิ่มเติม"><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="สี ลักษณะ จุดสังเกต" /></Field></div>
        </div>
        <div className="grid gap-3 rounded-2xl border border-slate-200 p-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={storeNow} onChange={(e) => setStoreNow(e.target.checked)} />เก็บเข้าคลังทันที
          </label>
          {storeNow && (<Field label="ชั้น/ช่อง (Shelf Code)" hint="เช่น A-2-03"><Input value={shelfCode} onChange={(e) => setShelfCode(e.target.value)} placeholder="A-2-03" /></Field>)}
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => { setFinderName(""); setFinderContact(""); setFinderNote(""); setTitle(""); setCategory("ทั่วไป"); setDescription(""); setLocationFound(""); setDateFound(todayISO()); setStorageLocation(""); setImageUrl(""); setStoreNow(true); setShelfCode(""); }}>ล้างฟอร์ม</Button>
          <Button onClick={submit} disabled={!canSubmit}>บันทึกการรับมอบ</Button>
        </div>
      </div>
    </div>
  )
}
