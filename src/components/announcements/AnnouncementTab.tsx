import React, { useState } from 'react'
import type { Announcement, Item } from '../../types'
import { uid } from '../../utils'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Field } from '../ui/Field'
import { Button } from '../ui/Button'
import { AnnouncementPreview } from './AnnouncementPreview'

export const AnnouncementTab: React.FC<{ items: Item[]; anns: Announcement[]; onCreate: (a: Announcement) => void; onDelete: (id: string) => void; staffName: string; }>
  = ({ items, anns, onCreate, onDelete, staffName }) => {
  const [mode, setMode] = useState<'editor' | 'board'>('editor')
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [linkedId, setLinkedId] = useState<string>("")
  const [q, setQ] = useState("")
  const [previewAnn, setPreviewAnn] = useState<Announcement | null>(null)

  const canPost = title.trim() && body.trim()

  const prefillFromItem = () => {
    if (!linkedId) return
    const it = items.find(i => i.id === linkedId)
    if (!it) return
    if (!title.trim()) setTitle(`ประกาศตามหาเจ้าของ: ${it.title}`)
    const tmpl = `พบ "${it.title}" เมื่อ ${it.dateFound} บริเวณ ${it.locationFound}.
ผู้ใดเป็นเจ้าของ โปรดติดต่อรับคืนที่ ${it.storageLocation}.`
    if (!body.trim()) setBody(tmpl)
  }

  const post = () => {
    if (!canPost) return
    const ann: Announcement = { id: uid(), title: title.trim(), body: body.trim(), itemId: linkedId || undefined, createdAt: new Date().toISOString(), createdBy: staffName || 'staff' }
    onCreate(ann); setTitle(""); setBody(""); setLinkedId(""); setMode('board')
  }

  const filtered = anns.filter(a => (q.trim() ? `${a.title} ${a.body}`.toLowerCase().includes(q.toLowerCase()) : true))

  const resolveItem = (a: Announcement): Item | null => (a.itemId ? (items.find(i => i.id === a.itemId) || null) : null)

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex rounded-xl border border-slate-200 p-1">
          <button className={["px-3 py-1.5 rounded-lg text-sm font-medium", mode === 'editor' ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"].join(" ")} onClick={() => setMode('editor')}>✍️ โพสประกาศ</button>
          <button className={["px-3 py-1.5 rounded-lg text-sm font-medium", mode === 'board' ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"].join(" ")} onClick={() => setMode('board')}>📢 กระดานประกาศ (โฆษก)</button>
        </div>
        {mode === 'board' && (<Input placeholder="ค้นหาประกาศ…" value={q} onChange={(e) => setQ(e.target.value)} className="w-56" />)}
      </div>
      {mode === 'editor' ? (
        <div className="mt-4 grid gap-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="เชื่อมกับรายการ (ถ้ามี)">
              <select value={linkedId} onChange={(e) => setLinkedId(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="">— ไม่เชื่อม —</option>
                {items.map(it => (<option key={it.id} value={it.id}>{it.title}</option>))}
              </select>
            </Field>
            <div className="md:col-span-2 flex items-end gap-2"><Button variant="ghost" onClick={prefillFromItem}>เติมข้อความจากรายการ</Button></div>
          </div>
          <Field label="หัวข้อประกาศ" required><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น ประกาศตามหาเจ้าของ: กระเป๋าสตางค์" /></Field>
          <Field label="เนื้อหาประกาศ" required><Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="พิมพ์รายละเอียดสำหรับใบประกาศ" /></Field>
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => { setTitle(""); setBody(""); setLinkedId(""); }}>ล้าง</Button>
            <Button variant="ghost" onClick={() => setPreviewAnn({ id: uid(), title: title.trim() || "(ตัวอย่างประกาศ)", body: body.trim() || "ข้อความตัวอย่าง", createdAt: new Date().toISOString(), createdBy: staffName || 'staff', itemId: linkedId || undefined })} disabled={!canPost}>พรีวิว</Button>
            <Button onClick={post} disabled={!canPost}>บันทึกประกาศ</Button>
          </div>
          {anns.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-semibold text-slate-900">ประกาศล่าสุด</div>
              <div className="mt-2 grid gap-2">
                {anns.slice(0,5).map(a => (
                  <div key={a.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-900">{a.title}</div>
                      <div className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleString()} • โดย {a.createdBy}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" onClick={() => setPreviewAnn(a)}>ดู/พิมพ์</Button>
                      <Button variant="danger" onClick={() => onDelete(a.id)}>ลบ</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600">ยังไม่มีประกาศ</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {filtered.map(a => (
                <div key={a.id} className="rounded-2xl border border-slate-200 p-4 bg-white">
                  <div className="text-sm font-semibold text-slate-900 truncate">{a.title}</div>
                  <div className="mt-1 line-clamp-3 text-sm text-slate-700">{a.body}</div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>{new Date(a.createdAt).toLocaleString()}</span>
                    <Button variant="ghost" onClick={() => setPreviewAnn(a)}>อ่าน/พิมพ์</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {previewAnn && (<AnnouncementPreview ann={previewAnn} item={resolveItem(previewAnn)} onClose={() => setPreviewAnn(null)} />)}
    </div>
  )
}
