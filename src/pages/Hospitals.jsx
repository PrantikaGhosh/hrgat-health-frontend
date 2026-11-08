import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, MapPin, Bed, Activity } from 'lucide-react'
import { hospitalsApi } from '../api'
import { Card, Badge, Button, PageLoader, EmptyState, Modal, Input } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const EMPTY_FORM = { name: '', city: '', state: 'TX', hrr_id: '', hrr_city: '', total_beds: '', total_icu_beds: '' }

export default function Hospitals() {
  const { isAdmin } = useAuth()
  const { showToast } = useToast()
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const loadHospitals = () => {
    hospitalsApi
      .list()
      .then(({ data }) => {
        setHospitals(data.hospitals)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadHospitals()
  }, [])

  const filtered = useMemo(() => {
    if (!search) return hospitals
    const q = search.toLowerCase()
    return hospitals.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.city?.toLowerCase().includes(q) ||
        h.hrr_city?.toLowerCase().includes(q)
    )
  }, [hospitals, search])

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await hospitalsApi.create({
        ...form,
        hrr_id: form.hrr_id ? Number(form.hrr_id) : null,
        total_beds: form.total_beds ? Number(form.total_beds) : null,
        total_icu_beds: form.total_icu_beds ? Number(form.total_icu_beds) : null,
      })
      showToast('Hospital added successfully')
      setShowAddModal(false)
      setForm(EMPTY_FORM)
      loadHospitals()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Could not add hospital', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink">Hospitals</h1>
          <p className="text-sm text-ink/40 font-body mt-1">{hospitals.length} hospitals across the referral network</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add hospital
          </Button>
        )}
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, city, or region..."
          className="w-full rounded-xl border border-ink/10 pl-10 pr-4 py-2.5 text-sm font-body focus:border-teal focus:ring-1 focus:ring-teal outline-none bg-white"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="No hospitals found" description="Try a different search term." />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((h) => (
            <Link key={h.hospital_id} to={`/hospitals/${h.hospital_id}`}>
              <Card className="p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer h-full">
                <p className="font-medium text-ink font-body mb-1">{h.name}</p>
                <p className="text-xs text-ink/40 font-body flex items-center gap-1 mb-4">
                  <MapPin size={12} /> {h.city}, {h.state} · {h.hrr_city}
                </p>
                <div className="flex gap-2">
                  <Badge tone="teal">
                    <Bed size={11} className="inline mr-1" />
                    {h.total_beds ?? '—'}
                  </Badge>
                  <Badge tone="amber">
                    <Activity size={11} className="inline mr-1" />
                    {h.total_icu_beds ?? '—'} ICU
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add hospital">
        <form onSubmit={handleAdd}>
          <Input label="Hospital name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Input label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="HRR ID"
              type="number"
              value={form.hrr_id}
              onChange={(e) => setForm({ ...form, hrr_id: e.target.value })}
            />
            <Input
              label="HRR city"
              value={form.hrr_city}
              onChange={(e) => setForm({ ...form, hrr_city: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Total beds"
              type="number"
              value={form.total_beds}
              onChange={(e) => setForm({ ...form, total_beds: e.target.value })}
            />
            <Input
              label="Total ICU beds"
              type="number"
              value={form.total_icu_beds}
              onChange={(e) => setForm({ ...form, total_icu_beds: e.target.value })}
            />
          </div>
          <p className="text-xs text-ink/40 font-body mb-4">
            Manually added hospitals won't have forecast data, only hospitals in the original trained dataset do.
          </p>
          <Button type="submit" loading={saving} className="w-full">
            Add hospital
          </Button>
        </form>
      </Modal>
    </div>
  )
}
