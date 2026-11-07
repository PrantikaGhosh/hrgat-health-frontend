import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, ArrowRight, Loader2 } from 'lucide-react'
import { authApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.loginRequest(email)
      setStep('otp')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not send OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.verifyOtp(email, otp)
      login(data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-teal-deep flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07]">
        <svg width="100%" height="100%">
          <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="white" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
            <Activity size={22} className="text-white" />
          </div>
          <h1 className="font-display font-semibold text-xl text-white">HRGAT-Health</h1>
          <p className="text-white/40 text-sm font-body mt-1">Referral-network capacity forecasting</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-7">
          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                onSubmit={handleRequestOtp}
              >
                <h2 className="font-display font-semibold text-ink mb-1">Sign in</h2>
                <p className="text-sm text-ink/50 font-body mb-5">Enter your email to receive a login code.</p>
                <label className="block mb-5">
                  <span className="block text-xs font-medium text-ink/60 mb-1.5 font-body">Email</span>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@hospital.org"
                    className="w-full rounded-xl border border-ink/10 px-3.5 py-2.5 text-sm font-body focus:border-teal focus:ring-1 focus:ring-teal outline-none"
                  />
                </label>
                {error && <p className="text-coral text-sm font-body mb-4">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal text-white px-4 py-2.5 text-sm font-medium font-body hover:bg-teal-deep transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Send code <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                onSubmit={handleVerifyOtp}
              >
                <h2 className="font-display font-semibold text-ink mb-1">Enter code</h2>
                <p className="text-sm text-ink/50 font-body mb-5">
                  We sent a 4-digit code to <span className="text-ink font-medium">{email}</span>
                </p>
                <label className="block mb-5">
                  <span className="block text-xs font-medium text-ink/60 mb-1.5 font-body">Code</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    autoFocus
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    className="w-full rounded-xl border border-ink/10 px-3.5 py-2.5 text-lg font-mono tracking-[0.4em] text-center focus:border-teal focus:ring-1 focus:ring-teal outline-none"
                  />
                </label>
                {error && <p className="text-coral text-sm font-body mb-4">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal text-white px-4 py-2.5 text-sm font-medium font-body hover:bg-teal-deep transition-colors disabled:opacity-50 mb-3"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify and sign in'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setOtp('')
                    setError('')
                  }}
                  className="w-full text-sm text-ink/40 hover:text-ink/70 font-body transition-colors"
                >
                  Use a different email
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
