import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id))
    }, 4000)
  }, [])

  const dismissToast = (id) => setToasts((t) => t.filter((toast) => toast.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-80">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              className={`flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg border bg-white ${
                toast.type === 'error' ? 'border-coral/30' : 'border-sage/30'
              }`}
            >
              {toast.type === 'error' ? (
                <XCircle size={18} className="mt-0.5 shrink-0 text-coral" />
              ) : (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-sage" />
              )}
              <p className="text-sm font-body flex-1 text-ink">{toast.message}</p>
              <button onClick={() => dismissToast(toast.id)} className="text-ink/40 hover:text-ink">
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
