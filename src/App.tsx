import { useEffect, useMemo, useState } from 'react'
import type { Announcement, Item } from './types'
import { saveItems, loadItems, saveAnns, loadAnns, TAB_KEY, COLLAPSE_KEY, todayISO } from './utils'
import { StaffGate } from './components/StaffGate'
import { Input } from './components/ui/Input'
import { Badge } from './components/ui/Badge'
import { Button } from './components/ui/Button'
import { NewItemForm } from './components/forms/NewItemForm'
import { FinderHandoverForm } from './components/forms/FinderHandoverForm'
import { AnnouncementTab } from './components/announcements/AnnouncementTab'
import { ListAndFilters } from './components/ListAndFilters'
import { DetailsDrawer } from './components/DetailsDrawer'
import EditItemModal from './components/forms/EditItemModal'
import { Link } from 'react-router-dom'

export default function App() {
  const [unlocked, setUnlocked] = useState(false)
  const [staffName, setStaffName] = useState("")
  const [items, setItems] = useState<Item[]>(() => {
    const seed = loadItems(); if (seed.length) return seed
    return [
      { id: Math.random().toString(36).slice(2,10), title: "กุญแจรถ", category: "อุปกรณ์ส่วนตัว", description: "พวงกุญแจสีฟ้า ติดการ์ตูนเล็ก ๆ", locationFound: "ลานจอดรถ B2", dateFound: todayISO(), storageLocation: "โต๊ะประชาสัมพันธ์", reporter: "staff", status: "FOUND" },
      { id: Math.random().toString(36).slice(2,10), title: "กระเป๋าสตางค์", category: "เอกสาร/กระเป๋า", description: "สีน้ำตาล มีบัตรประชาชนชื่อ น.ส. ชมพู ชัยชนะ", locationFound: "โถงอาคาร A", dateFound: todayISO(), storageLocation: "ห้องธุรการ", reporter: "staff", status: "FOUND" },
    ]
  })
  const [anns, setAnns] = useState<Announcement[]>(() => loadAnns())
  const [formTab, setFormTab] = useState<"new" | "handover" | "announce">(() => {
    const v = localStorage.getItem(TAB_KEY); return (v === 'handover' || v === 'announce') ? (v as any) : 'new'
  })
  const [formCollapsed, setFormCollapsed] = useState<boolean>(() => localStorage.getItem(COLLAPSE_KEY) === '1')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [, setPreviewAnn] = useState<Announcement | null>(null)
  const [editingItem, setEditingItem] = useState<Item | null>(null)

  useEffect(() => { saveItems(items) }, [items])
  useEffect(() => { saveAnns(anns) }, [anns])
  useEffect(() => { localStorage.setItem(TAB_KEY, formTab) }, [formTab])
  useEffect(() => { localStorage.setItem(COLLAPSE_KEY, formCollapsed ? '1' : '0') }, [formCollapsed])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || (t as any).isContentEditable)) return
      if (e.altKey && e.key === '1') { e.preventDefault(); setFormTab('new'); setFormCollapsed(false) }
      else if (e.altKey && e.key === '2') { e.preventDefault(); setFormTab('handover'); setFormCollapsed(false) }
      else if (e.altKey && e.key === '3') { e.preventDefault(); setFormTab('announce'); setFormCollapsed(false) }
      else if (e.altKey && (e.key === 'm' || e.key === 'M')) { e.preventDefault(); setFormCollapsed(v => !v) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const addItem = (i: Item) => setItems((prev) => [i, ...prev])
  const claimItem = (id: string, who: string) => setItems((prev) => prev.map((it) => it.id === id ? { ...it, status: "CLAIMED", claimer: who, dateClaimed: todayISO() } : it))
  const deleteItem = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id))
  const storeItem = (id: string, shelf: string, storedBy: string) => setItems((prev) => prev.map((it) => it.id === id ? { ...it, status: "STORED", shelfCode: shelf, dateStored: todayISO(), storedBy } : it))
  const updateItem = (updated: Item) => setItems(prev => prev.map(it => it.id === updated.id ? updated : it))
  const addAnn = (a: Announcement) => setAnns(prev => [a, ...prev])
  const deleteAnn = (id: string) => setAnns(prev => prev.filter(x => x.id !== id))
  const updateAnn = (id: string, patch: Partial<Announcement>) => setAnns(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a))

  const annCounts = useMemo(() => {
    const m: Record<string, number> = {}; anns.forEach(a => { if (a.itemId) m[a.itemId] = (m[a.itemId] || 0) + 1 })
    return m
  }, [anns])
  const annLatestByItem = useMemo(() => {
    const m: Record<string, Announcement> = {}; anns.forEach(a => {
      if (!a.itemId) return; const prev = m[a.itemId]
      if (!prev || new Date(a.createdAt) > new Date(prev.createdAt)) m[a.itemId] = a
    }); return m
  }, [anns])

  const pendingCount = items.filter(i => i.status !== "CLAIMED").length

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-2xl bg-slate-900 text-white grid place-items-center">🧭</div>
            <div><div className="text-sm font-semibold text-slate-900">Lost &amp; Found</div><div className="text-xs text-slate-500">Staff Console</div></div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/reports" className="rounded-2xl px-3 py-1.5 text-sm font-medium bg-white text-slate-700 hover:bg-slate-50 border border-slate-200">รายงาน</Link>
            {unlocked && (<div className="flex items-center gap-2"><Input placeholder="ชื่อเจ้าหน้าที่" value={staffName} onChange={(e) => setStaffName(e.target.value)} className="h-9 w-44" /><Badge>{pendingCount} รายการยังไม่รับคืน</Badge></div>)}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6">
        {!unlocked ? (
          <div className="mx-auto mt-10 max-w-lg"><StaffGate onUnlock={() => setUnlocked(true)} /></div>
        ) : (
          <>
            <div className="no-print">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                <div role="tablist" aria-label="เลือกฟอร์มบันทึก" className="inline-flex">
                  <button role="tab" aria-selected={formTab === 'new'} title="Alt+1"
                    className={["px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-2", formTab === 'new' ? "bg-slate-900 text-white shadow" : "text-slate-700 hover:bg-slate-50"].join(" ")}
                    onClick={() => { setFormTab('new'); }}><span aria-hidden>📝</span><span>บันทึกของหาย</span></button>
                  <button role="tab" aria-selected={formTab === 'handover'} title="Alt+2"
                    className={["px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-2", formTab === 'handover' ? "bg-slate-900 text-white shadow" : "text-slate-700 hover:bg-slate-50"].join(" ")}
                    onClick={() => { setFormTab('handover'); }}><span aria-hidden>📣</span><span>แจ้งของหาย</span></button>
                  <button role="tab" aria-selected={formTab === 'announce'} title="Alt+3"
                    className={["px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-2", formTab === 'announce' ? "bg-slate-900 text-white shadow" : "text-slate-700 hover:bg-slate-50"].join(" ")}
                    onClick={() => { setFormTab('announce'); }}><span aria-hidden>📜</span><span>ประกาศ</span></button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden md:inline text-xs text-slate-500">Alt+1 / Alt+2 / Alt+3 • Alt+M</span>
                  <Button variant="ghost" aria-pressed={formCollapsed} title="ย่อ/ขยายฟอร์ม (Alt+M)" onClick={() => setFormCollapsed(v => !v)}>
                    {formCollapsed ? 'แสดงฟอร์ม' : 'ย่อฟอร์ม'} <span aria-hidden>🗕</span>
                  </Button>
                </div>
              </div>
            </div>

            {!formCollapsed && (formTab === 'new' ? (
              <NewItemForm onAdd={addItem} staffName={staffName || "staff"} />
            ) : formTab === 'handover' ? (
              <FinderHandoverForm onAdd={addItem} staffName={staffName || "staff"} />
            ) : (
              <AnnouncementTab items={items} anns={anns} onCreate={addAnn} onDelete={deleteAnn} onUpdate={updateAnn} staffName={staffName || "staff"} />
            ))}

            <ListAndFilters items={items} onClaim={claimItem} onDelete={deleteItem} onStore={storeItem}
              staffName={staffName || "staff"} onOpenDetails={(id) => setDetailId(id)}
              onOpenAnnPreview={(id) => { const a = annLatestByItem[id]; if (a) setPreviewAnn(a); }} annCounts={annCounts} onEditRequest={(item) => setEditingItem(item)} />

            {detailId && (<DetailsDrawer item={items.find(i => i.id === detailId)!} onClose={() => setDetailId(null)} onEditRequest={(it) => { setEditingItem(it); }} />)}
            {editingItem && (<EditItemModal item={editingItem} onClose={() => setEditingItem(null)} onSave={(updated) => { updateItem(updated); setEditingItem(null); }} />)}
          </>
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-12 pt-4 text-center text-xs text-slate-500">• Demo เท่านั้น – ไม่มีระบบยืนยันตัวตน/สิทธิ์แบบจริง •</footer>
    </div>
  )
}
