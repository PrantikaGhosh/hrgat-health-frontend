import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute, AdminRoute } from './components/guards'
import { ToastProvider } from './context/ToastContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Hospitals from './pages/Hospitals'
import HospitalDetail from './pages/HospitalDetail'
import AdminUsers from './pages/AdminUsers'

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/hospitals/:id" element={<HospitalDetail />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin/users" element={<AdminUsers />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </ToastProvider>
  )
}
