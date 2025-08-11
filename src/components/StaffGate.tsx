import React, { useState } from 'react'
import { PIN_KEY } from '../utils'
import { Field } from './ui/Field'
import { Input } from './ui/Input'
import { Button } from './ui/Button'

export const StaffGate: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [pin, setPin] = useState("")
  const [step, setStep] = useState<'enter' | 'create'>(() => (localStorage.getItem(PIN_KEY) ? 'enter' : 'create'))
  const [error, setError] = useState<string | null>(null)

  const savePin = () => {
    if (pin.trim().length < 4) { setError("ตั้ง PIN อย่างน้อย 4 ตัวอักษร"); return }
    localStorage.setItem(PIN_KEY, pin.trim()); onUnlock()
  }
  const checkPin = () => { const stored = localStorage.getItem(PIN_KEY); if (pin === stored) onUnlock(); else setError("PIN ไม่ถูกต้อง") }

  return (
    <div className="mx-auto max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-900">🔒 Staff Only</h1>
      <p className="mt-1 text-sm text-slate-600">ระบบนี้สำหรับเจ้าหน้าที่เท่านั้น โปรด{step === 'create' ? 'ตั้ง' : 'ใส่'}รหัสผ่าน (PIN)</p>
      <div className="mt-4 grid gap-3">
        <Field label={step === 'create' ? "ตั้ง PIN" : "ใส่ PIN"} required>
          <Input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" />
        </Field>
        {error && <div className="text-sm text-rose-600">{error}</div>}
        <div className="flex items-center gap-2">
          {step === 'create' ? (<Button onClick={savePin}>บันทึกและเข้าใช้งาน</Button>) : (<Button onClick={checkPin}>เข้าสู่ระบบ</Button>)}
          {step === 'enter' && (<Button variant="ghost" onClick={() => setStep('create')}>ลืม PIN? ตั้งใหม่</Button>)}
        </div>
      </div>
    </div>
  )
}
