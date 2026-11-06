import { createContext, useContext, useState, useCallback } from 'react'
import { getStoredAuth, storeAuth, clearAuth } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getStoredAuth())

  const login = useCallback((authData) => {
    storeAuth(authData)
    setAuth(authData)
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    setAuth(null)
  }, [])

  const isAdmin = auth?.role === 'admin'
  const isStaff = auth?.role === 'staff'

  return (
    <AuthContext.Provider value={{ auth, login, logout, isAdmin, isStaff, isAuthenticated: !!auth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
