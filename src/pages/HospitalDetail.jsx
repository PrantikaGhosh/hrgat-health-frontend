import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Bed,
  Activity,
  Users,
  TrendingUp,
  UserPlus,
  LogOut as DischargeIcon,
  ArrowRightLeft,
  Network,
} from 'lucide-react'
import { hospitalsApi, admissionsApi } from '../api'
import { Card, Badge, Button, PageLoader, EmptyState, Modal, Input, Select, StatCard } from '../components/ui'
import { OccupancyChart } from '../components/OccupancyChart'
import { useToast } from '../context/ToastContext'

const EMPTY_ADMIT_FORM = { patient_name: '', age: '', gender: '', bed_type: 'general' }

export default function HospitalDetail() {
  const { id } = useParams()
  const { showToast } = useToast()
  // Always holds the ID currently being viewed, updated on every render.
  // Used so an in-flight request for a hospital the user has since
  // navigated away from can detect it's stale and discard itself,
  // instead of overwriting fresher data with old numbers.
  const idRef = useRef(id)
  idRef.current = id

  const [hospital, setHospital] = useState(null)
  const [occupancy, setOccupancy] = useState(null)
  const [patients, setPatients] = useState([])
  const [neighbors, setNeighbors] = useState([])
  const [history, setHistory] = useState([])
  const [forecast, setForecast] = useState(null)
  const [target, setTarget] = useState('icu')
  const [loading, setLoading] = useState(true)

  const [showAdmit, setShowAdmit] = useState(false)
  const [showTransfer, setShowTransfer] = useState(null)
  const [admitForm, setAdmitForm] = useState(EMPTY_ADMIT_FORM)
  const [transferOptions, setTransferOptions] = useState([])
  const [transferSearch, setTransferSearch] = useState('')
  const [loadingTransferOptions, setLoadingTransferOptions] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadAll = async () => {
    const requestedId = id
    try {
      const [hRes, occRes, patRes, neighRes] = await Promise.all([
        hospitalsApi.get(requestedId),
        hospitalsApi.occupancy(requestedId),
        hospitalsApi.patients(requestedId),
        hospitalsApi.neighbors(requestedId),
      ])
      if (idRef.current !== requestedId) return // navigated away before this resolved, discard
      setHospital(hRes.data)
      setOccupancy(occRes.data)
      setPatients(patRes.data)
      setNeighbors(neighRes.data.hospitals)
    } catch {
      if (idRef.current === requestedId) showToast('Could not load hospital data', 'error')
    } finally {
      if (idRef.current === requestedId) setLoading(false)
    }
  }

  const loadChartData = async (t) => {
    const requestedId = id
    try {
      const [histRes, foreRes] = await Promise.all([
        hospitalsApi.history(requestedId, t, 16),
        hospitalsApi.forecast(requestedId, t).catch(() => ({ data: null })),
      ])
      if (idRef.current !== requestedId) return // navigated away before this resolved, discard
      setHistory(histRes.data.history)
      setForecast(foreRes.data)
    } catch {
      if (idRef.current === requestedId) {
        setHistory([])
        setForecast(null)
      }
    }
  }

  useEffect(() => {
    setLoading(true)
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    loadChartData(target)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, target])

  const handleAdmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await admissionsApi.admit({
        hospital_id: Number(id),
        patient_name: admitForm.patient_name,
        age: admitForm.age ? Number(admitForm.age) : null,
        gender: admitForm.gender || null,
        bed_type: admitForm.bed_type,
      })
      showToast('Patient admitted')
      setShowAdmit(false)
      setAdmitForm(EMPTY_ADMIT_FORM)
      loadAll()
      loadChartData(target)
    } catch (err) {
      showToast(err.response?.data?.detail || 'Could not admit patient', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDischarge = async (admissionId) => {
    try {
      await admissionsApi.discharge(admissionId)
      showToast('Patient discharged')
      loadAll()
      loadChartData(target)
    } catch (err) {
      showToast(err.response?.data?.detail || 'Could not discharge patient', 'error')
    }
  }

  const openTransfer = async (admissionId) => {
    setShowTransfer(admissionId)
    setTransferSearch('')
    setLoadingTransferOptions(true)
    try {
      const { data } = await hospitalsApi.transferOptions(id)
      setTransferOptions(data.options)
    } catch (err) {
      showToast(err.response?.data?.detail || 'Could not load transfer options', 'error')
    } finally {
      setLoadingTransferOptions(false)
    }
  }

  const handleTransferTo = async (destinationHospitalId, bedType) => {
    setSaving(true)
    try {
      await admissionsApi.transfer(showTransfer, destinationHospitalId, bedType)
      showToast('Patient transferred')
      setShowTransfer(null)
      loadAll()
      loadChartData(target)
    } catch (err) {
      showToast(err.response?.data?.detail || 'Could not transfer patient', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader />
  if (!hospital) return <EmptyState title="Hospital not found" />

  return (
    <div>
      <Link
        to="/hospitals"
        className="inline-flex items-center gap-1.5 text-sm text-ink/40 hover:text-ink font-body mb-4 transition-colors"
      >
        <ArrowLeft size={14} /> Back to hospitals
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink">{hospital.name}</h1>
          <p className="text-sm text-ink/40 font-body mt-1">
            {hospital.city}, {hospital.state} · {hospital.hrr_city} region
          </p>
        </div>
        <Button onClick={() => setShowAdmit(true)}>
          <UserPlus size={16} /> Admit patient
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="General beds occupied"
          value={occupancy.occupied_general}
          unit={`/ ${occupancy.total_beds ?? '—'}`}
          icon={Bed}
          tone="teal"
        />
        <StatCard
          label="ICU beds occupied"
          value={occupancy.occupied_icu}
          unit={`/ ${occupancy.total_icu_beds ?? '—'}`}
          icon={Activity}
          tone="amber"
        />
        <StatCard label="Active patients" value={patients.length} icon={Users} tone="sage" />
        <StatCard label="Connected hospitals" value={neighbors.length} icon={Network} tone="coral" />
      </div>

      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-semibold text-ink flex items-center gap-2">
              <TrendingUp size={17} className="text-teal" /> Occupancy trajectory
            </h2>
            <p className="text-sm text-ink/40 font-body">Historical trend with next-week STGAT forecast</p>
          </div>
          <div className="flex gap-1 bg-ink/5 rounded-lg p-1">
            <button
              onClick={() => setTarget('icu')}
              className={`px-3 py-1.5 text-xs font-medium font-body rounded-md transition-colors ${
                target === 'icu' ? 'bg-white text-teal shadow-sm' : 'text-ink/50'
              }`}
            >
              ICU
            </button>
            <button
              onClick={() => setTarget('beds')}
              className={`px-3 py-1.5 text-xs font-medium font-body rounded-md transition-colors ${
                target === 'beds' ? 'bg-white text-amber shadow-sm' : 'text-ink/50'
              }`}
            >
              General beds
            </button>
          </div>
        </div>
        {history.length > 0 ? (
          <OccupancyChart history={history} forecast={forecast} target={target} />
        ) : (
          <EmptyState
            icon={TrendingUp}
            title="No forecast data"
            description="This hospital wasn't part of the trained model."
          />
        )}
      </Card>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <h2 className="font-display font-semibold text-ink mb-4">Current patients</h2>
          {patients.length === 0 ? (
            <Card className="p-8">
              <EmptyState icon={Users} title="No active patients" description="Admit a patient to get started." />
            </Card>
          ) : (
            <Card className="divide-y divide-ink/[0.06]">
              {patients.map((p) => (
                <div key={p.admission_id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="font-medium text-ink font-body text-sm">{p.name}</p>
                    <p className="text-xs text-ink/40 font-body">
                      {p.age ? `${p.age} yrs` : ''} {p.gender ? `· ${p.gender}` : ''}{' '}
                      <Badge tone={p.bed_type === 'icu' ? 'amber' : 'teal'}>{p.bed_type}</Badge>
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => openTransfer(p.admission_id)}
                      className="text-xs font-medium text-teal hover:text-teal-deep font-body flex items-center gap-1"
                    >
                      <ArrowRightLeft size={13} /> Transfer
                    </button>
                    <button
                      onClick={() => handleDischarge(p.admission_id)}
                      className="text-xs font-medium text-coral hover:text-coral/70 font-body flex items-center gap-1"
                    >
                      <DischargeIcon size={13} /> Discharge
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>

        <div>
          <h2 className="font-display font-semibold text-ink mb-4">Referral network</h2>
          <Card className="p-4">
            {neighbors.length === 0 ? (
              <p className="text-sm text-ink/40 font-body p-4 text-center">No connected hospitals on file.</p>
            ) : (
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {neighbors.map((n) => (
                  <Link
                    key={n.hospital_id}
                    to={`/hospitals/${n.hospital_id}`}
                    className="flex items-center justify-between px-2 py-2.5 rounded-lg hover:bg-ink/[0.03] transition-colors"
                  >
                    <span className="text-sm text-ink font-body truncate">{n.name}</span>
                    <span className="text-xs text-ink/30 font-mono shrink-0 ml-2">{n.total_icu_beds ?? '—'} ICU</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal open={showAdmit} onClose={() => setShowAdmit(false)} title="Admit patient">
        <form onSubmit={handleAdmit}>
          <Input
            label="Patient name"
            required
            value={admitForm.patient_name}
            onChange={(e) => setAdmitForm({ ...admitForm, patient_name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Age"
              type="number"
              value={admitForm.age}
              onChange={(e) => setAdmitForm({ ...admitForm, age: e.target.value })}
            />
            <Select
              label="Gender"
              value={admitForm.gender}
              onChange={(e) => setAdmitForm({ ...admitForm, gender: e.target.value })}
            >
              <option value="">Not specified</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </Select>
          </div>
          <Select
            label="Bed type"
            value={admitForm.bed_type}
            onChange={(e) => setAdmitForm({ ...admitForm, bed_type: e.target.value })}
          >
            <option value="general">General ward</option>
            <option value="icu">ICU</option>
          </Select>
          <Button type="submit" loading={saving} className="w-full mt-2">
            Admit patient
          </Button>
        </form>
      </Modal>

      <Modal open={!!showTransfer} onClose={() => setShowTransfer(null)} title="Transfer patient" width="max-w-lg">
        <input
          value={transferSearch}
          onChange={(e) => setTransferSearch(e.target.value)}
          placeholder="Search hospitals..."
          className="w-full rounded-xl border border-ink/10 px-3.5 py-2.5 text-sm font-body focus:border-teal focus:ring-1 focus:ring-teal outline-none mb-4"
        />
        {loadingTransferOptions ? (
          <PageLoader />
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2 -mx-1 px-1">
            {transferOptions
              .filter((o) => o.name.toLowerCase().includes(transferSearch.toLowerCase()))
              .map((o) => {
                const icuFull = o.available_icu !== null && o.available_icu <= 0
                const generalFull = o.available_general !== null && o.available_general <= 0
                return (
                  <div key={o.hospital_id} className="border border-ink/[0.08] rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-ink font-body truncate">{o.name}</p>
                      {o.is_suggested && <Badge tone="teal">Suggested</Badge>}
                    </div>
                    <p className="text-xs text-ink/40 font-body mb-2.5">{o.city}</p>
                    <div className="flex gap-2">
                      <button
                        disabled={icuFull || saving}
                        onClick={() => handleTransferTo(o.hospital_id, 'icu')}
                        className="flex-1 text-xs font-medium font-body rounded-lg px-3 py-2 bg-amber/10 text-amber hover:bg-amber/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        ICU · {o.available_icu ?? '—'} available
                      </button>
                      <button
                        disabled={generalFull || saving}
                        onClick={() => handleTransferTo(o.hospital_id, 'general')}
                        className="flex-1 text-xs font-medium font-body rounded-lg px-3 py-2 bg-teal-light text-teal-deep hover:bg-teal-light/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        General · {o.available_general ?? '—'} available
                      </button>
                    </div>
                  </div>
                )
              })}
            {transferOptions.length === 0 && (
              <p className="text-sm text-ink/40 font-body text-center py-8">
                No hospitals with available capacity found.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
