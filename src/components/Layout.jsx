import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Building2, Users, LogOut, Activity } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Layout() {
  const { auth, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/hospitals', label: 'Hospitals', icon: Building2 },
    ...(isAdmin ? [{ to: '/admin/users', label: 'Team', icon: Users }] : []),
  ]

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <aside className="w-64 bg-teal-deep text-white flex flex-col shrink-0">
        <div className="px-6 py-6 flex items-center gap-2.5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Activity size={17} className="text-white" />
          </div>
          <div>
            <p className="font-display font-semibold text-[15px] leading-tight">HRGAT-Health</p>
            <p className="text-[11px] text-white/40 font-body leading-tight">Network capacity</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium font-body transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium text-white truncate font-body">{auth?.email}</p>
            <p className="text-[11px] text-white/40 capitalize font-body">{auth?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium font-body text-white/60 hover:text-white hover:bg-white/5 transition-colors w-full"
          >
            <LogOut size={17} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
