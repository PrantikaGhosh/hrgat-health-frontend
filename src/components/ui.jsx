import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-ink/[0.06] shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-ink/5 text-ink/70',
    teal: 'bg-teal-light text-teal-deep',
    amber: 'bg-amber/10 text-amber',
    coral: 'bg-coral/10 text-coral',
    sage: 'bg-sage/10 text-sage',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-body ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function Button({ children, variant = 'primary', className = '', loading = false, ...props }) {
  const variants = {
    primary: 'bg-teal text-white hover:bg-teal-deep disabled:opacity-50',
    secondary: 'bg-teal-light text-teal-deep hover:bg-teal-light/70',
    ghost: 'text-ink/70 hover:bg-ink/5',
    danger: 'bg-coral text-white hover:bg-coral/90',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium font-body transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  )
}

export function Spinner({ size = 20 }) {
  return <Loader2 size={size} className="animate-spin text-teal" />
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={28} />
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-teal-light flex items-center justify-center mb-4">
          <Icon size={22} className="text-teal" />
        </div>
      )}
      <h3 className="font-display font-semibold text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-ink/50 max-w-sm mb-4 font-body">{description}</p>}
      {action}
    </div>
  )
}

export function StatCard({ label, value, unit, icon: Icon, tone = 'teal' }) {
  const tones = {
    teal: 'text-teal bg-teal-light',
    amber: 'text-amber bg-amber/10',
    coral: 'text-coral bg-coral/10',
    sage: 'text-sage bg-sage/10',
  }
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink/50 font-body mb-1">{label}</p>
          <p className="font-mono text-2xl font-semibold text-ink">
            {value}
            {unit && <span className="text-sm text-ink/40 ml-1 font-body">{unit}</span>}
          </p>
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </Card>
  )
}

export function Modal({ open, onClose, title, children, width = 'max-w-md' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18 }}
        className={`relative bg-white rounded-2xl shadow-xl w-full ${width} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/[0.06]">
          <h2 className="font-display font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  )
}

export function Input({ label, ...props }) {
  return (
    <label className="block mb-4">
      {label && <span className="block text-xs font-medium text-ink/60 mb-1.5 font-body">{label}</span>}
      <input
        className="w-full rounded-xl border border-ink/10 px-3.5 py-2.5 text-sm font-body focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-colors"
        {...props}
      />
    </label>
  )
}

export function Select({ label, children, ...props }) {
  return (
    <label className="block mb-4">
      {label && <span className="block text-xs font-medium text-ink/60 mb-1.5 font-body">{label}</span>}
      <select
        className="w-full rounded-xl border border-ink/10 px-3.5 py-2.5 text-sm font-body focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-colors bg-white"
        {...props}
      >
        {children}
      </select>
    </label>
  )
}
