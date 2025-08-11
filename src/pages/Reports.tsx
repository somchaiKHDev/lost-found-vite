import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Item, Announcement } from '../types'
import { loadItems, loadAnns, todayISO } from '../utils'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line } from 'recharts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

type CatCount = { name: string; count: number }
type DailyRow = { date: string; found: number; claimed: number }

function daysBetween(a: string, b: string){
  const da = new Date(a).getTime(); const db = new Date(b).getTime()
  return Math.max(0, Math.round((db - da) / 86400000))
}

function formatDate(d: Date){
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0,10)
}

function lastNDates(n: number): string[]{
  const out: string[] = []
  const now = new Date()
  for (let i = n-1; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate() - i)
    out.push(formatDate(d))
  }
  return out
}

function downloadText(filename: string, text: string, mime = 'text/plain;charset=utf-8'){
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function csvEscape(v: any){
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

function objectsToCSV(rows: Record<string, any>[]): string{
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const lines = [headers.join(',')]
  for (const r of rows){
    lines.push(headers.map(h => csvEscape(r[h])).join(','))
  }
  return lines.join('\n')
}

export default function ReportsPage(){
  const [items, setItems] = useState<Item[]>([])
  const [anns, setAnns] = useState<Announcement[]>([])

  useEffect(() => {
    setItems(loadItems()); setAnns(loadAnns())
    const onStorage = (e: StorageEvent) => { if (e.key) { setItems(loadItems()); setAnns(loadAnns()) } }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const total = items.length
  const found = items.filter(i => i.status === 'FOUND').length
  const stored = items.filter(i => i.status === 'STORED').length
  const claimed = items.filter(i => i.status === 'CLAIMED').length
  const claimRate = total ? Math.round((claimed/total)*100) : 0

  const avgDaysToClaim = useMemo(() => {
    const ds = items.filter(i => i.status === 'CLAIMED' && i.dateFound && i.dateClaimed).map(i => daysBetween(i.dateFound, i.dateClaimed!))
    if (!ds.length) return 0
    return Math.round(ds.reduce((a,b)=>a+b,0) / ds.length)
  }, [items])

  const byCategory: CatCount[] = useMemo(() => {
    const map: Record<string, number> = {}
    items.forEach(i => { map[i.category] = (map[i.category] || 0) + 1 })
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([name,count]) => ({name, count}))
  }, [items])

  const dailyData: DailyRow[] = useMemo(() => {
    const days = lastNDates(30)
    const foundMap: Record<string, number> = {}; const claimMap: Record<string, number> = {}
    items.forEach(i => { foundMap[i.dateFound] = (foundMap[i.dateFound] || 0) + 1 })
    items.filter(i => i.status === 'CLAIMED' && i.dateClaimed).forEach(i => {
      const d = i.dateClaimed!; claimMap[d] = (claimMap[d] || 0) + 1
    })
    return days.map(d => ({ date: d.slice(5), found: foundMap[d] || 0, claimed: claimMap[d] || 0 }))
  }, [items])

  const recentAnns = anns.slice(0, 5)

  // Exports
  const exportItemsCSV = () => {
    const rows = items.map(i => ({
      id: i.id, title: i.title, category: i.category, status: i.status,
      locationFound: i.locationFound, dateFound: i.dateFound, storageLocation: i.storageLocation,
      reporter: i.reporter, shelfCode: i.shelfCode || '', dateStored: i.dateStored || '',
      claimer: i.claimer || '', dateClaimed: i.dateClaimed || '', finderName: i.finderName || '', dateHandover: i.dateHandover || ''
    }))
    const csv = objectsToCSV(rows)
    downloadText(`lost-found-items-${todayISO()}.csv`, csv, 'text/csv;charset=utf-8')
  }

  const exportCategoryCSV = () => {
    const csv = objectsToCSV(byCategory.map(c => ({ category: c.name, count: c.count })))
    downloadText(`lost-found-category-summary-${todayISO()}.csv`, csv, 'text/csv;charset=utf-8')
  }

  const exportPDF = async () => {
    const el = document.getElementById('report-content')
    if (!el) return
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth
    const imgHeight = canvas.height * imgWidth / canvas.width

    if (imgHeight <= pageHeight){
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    } else {
      const pageCanvas = document.createElement('canvas')
      const pageCtx = pageCanvas.getContext('2d')!
      pageCanvas.width = canvas.width
      const pageHeightPx = Math.floor(canvas.width * pageHeight / pageWidth)
      let y = 0, page = 0
      while (y < canvas.height){
        const sliceHeight = Math.min(pageHeightPx, canvas.height - y)
        pageCanvas.height = sliceHeight
        pageCtx.clearRect(0,0,pageCanvas.width,pageCanvas.height)
        pageCtx.drawImage(canvas, 0, y, canvas.width, sliceHeight, 0, 0, pageCanvas.width, sliceHeight)
        const img = pageCanvas.toDataURL('image/png')
        if (page > 0) pdf.addPage()
        pdf.addImage(img, 'PNG', 0, 0, imgWidth, sliceHeight * imgWidth / pageCanvas.width)
        y += sliceHeight; page += 1
      }
    }
    pdf.save('lost-found-reports.pdf')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-2xl bg-slate-900 text-white grid place-items-center">📊</div>
            <div><div className="text-sm font-semibold text-slate-900">Lost &amp; Found</div><div className="text-xs text-slate-500">Reports</div></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2">
              <Button variant="ghost" onClick={exportItemsCSV}>Export CSV (รายการ)</Button>
              <Button variant="ghost" onClick={exportCategoryCSV}>Export CSV (หมวดหมู่)</Button>
              <Button onClick={exportPDF}>Export PDF</Button>
            </div>
            <Link to="/" className="rounded-2xl px-3 py-1.5 text-sm font-medium bg-white text-slate-700 hover:bg-slate-50 border border-slate-200">แดชบอร์ด</Link>
          </div>
        </div>
      </header>

      <main id="report-content" className="mx-auto grid max-w-6xl gap-4 px-4 py-6">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">ทั้งหมด</div>
            <div className="mt-1 text-2xl font-extrabold">{total}</div>
            <div className="mt-1 text-xs text-slate-500">รายการ</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">FOUND</div>
            <div className="mt-1 text-2xl font-extrabold">{found}</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">STORED</div>
            <div className="mt-1 text-2xl font-extrabold">{stored}</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">CLAIMED</div>
            <div className="mt-1 text-2xl font-extrabold">{claimed}</div>
            <div className="mt-1 text-xs text-emerald-700">อัตรารับคืน {claimRate}%</div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">เฉลี่ยวันจนรับคืน</div>
            <div className="mt-2 text-3xl font-bold">{avgDaysToClaim} <span className="text-base font-medium text-slate-600">วัน</span></div>
            <div className="mt-1 text-xs text-slate-500">คำนวณจากรายการที่รับคืนแล้ว</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">ประกาศล่าสุด</div>
            <div className="mt-2 grid gap-2">
              {recentAnns.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">ยังไม่มีประกาศ</div>
              ) : recentAnns.map(a => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-900">{a.title}</div>
                    <div className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleString()}</div>
                  </div>
                  <Badge>ANN</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900 mb-2">Bar: จำนวนรายการตามหมวดหมู่</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="จำนวน" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900 mb-2">Line: รายวัน (30 วันล่าสุด)</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="found" name="พบ (Found)" />
                  <Line type="monotone" dataKey="claimed" name="รับคืน (Claimed)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-12 pt-4 text-center text-xs text-slate-500">• รายงานจะอัปเดตตามข้อมูลใน localStorage •</footer>
    </div>
  )
}
