import React, { useState } from 'react'
import type { Item } from '../../types'
import { uid, todayISO } from '../../utils'
import { Field } from '../ui/Field'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'

export const NewItemForm: React.FC<{ onAdd: (item: Item) => void; staffName: string }> = ({ onAdd, staffName }) => {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("ทั่วไป")
  const [description, setDescription] = useState("")
  const [locationFound, setLocationFound] = useState("")
  const [dateFound, setDateFound] = useState(todayISO())
  const [storageLocation, setStorageLocation] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  const canSubmit = title.trim() && locationFound.trim() && storageLocation.trim()

  const submit = () => {
    if (!canSubmit) return
    const item: Item = {
      id: uid(), title: title.trim(), category: category.trim(), description: description.trim() || undefined,
      locationFound: locationFound.trim(), dateFound, storageLocation: storageLocation.trim(),
      reporter: staffName.trim() || "staff", imageUrl: imageUrl.trim() || undefined, status: "FOUND",
    }
    onAdd(item)
    setTitle(""); setDescription(""); setLocationFound(""); setStorageLocation(""); setImageUrl(""); setCategory("ทั่วไป"); setDateFound(todayISO())
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">➕ บันทึกของหาย (Found)</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Field label="ชื่อสิ่งของ" required><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น กระเป๋าสตางค์" /></Field>
        <Field label="หมวดหมู่"><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="เช่น อิเล็กทรอนิกส์, เอกสาร, เสื้อผ้า" /></Field>
        <Field label="สถานที่พบ" required><Input value={locationFound} onChange={(e) => setLocationFound(e.target.value)} placeholder="โถงกลาง อาคาร A" /></Field>
        <Field label="วันที่พบ"><Input type="date" value={dateFound} onChange={(e) => setDateFound(e.target.value)} /></Field>
        <Field label="ที่เก็บ/จุดรับของ" required><Input value={storageLocation} onChange={(e) => setStorageLocation(e.target.value)} placeholder="ห้องธุรการ ชั้น 2" /></Field>
        <Field label="ลิงก์รูป (ถ้ามี)" hint="วาง URL ของรูปภาพเพื่อช่วยยืนยันสิ่งของ"><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" /></Field>
        <div className="md:col-span-2"><Field label="รายละเอียดเพิ่มเติม"><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="สีสัน ลักษณะพิเศษ รายละเอียดภายใน เป็นต้น" /></Field></div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={() => { setTitle(""); setDescription(""); setLocationFound(""); setStorageLocation(""); setImageUrl(""); setCategory("ทั่วไป"); setDateFound(todayISO()); }}>ล้างฟอร์ม</Button>
        <Button onClick={submit} disabled={!canSubmit}>บันทึก</Button>
      </div>
    </div>
  )
}
