import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import ReportsPage from './pages/Reports'

export default function AppRouter(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
