import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Bed, Activity, MapPin } from 'lucide-react'
import { hospitalsApi } from '../api'
import { StatCard, Card, PageLoader, Badge } from '../components/ui'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { auth } = useAuth()
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [regionSort, setRegionSort] = useState('icu')

  useEffect(() => {
    hospitalsApi
      .list()
      .then(({ data }) => {
        setHospitals(data.hospitals)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const totalIcuBeds = hospitals.reduce((sum, h) => sum + (h.total_icu_beds || 0), 0)
  const totalBeds = hospitals.reduce((sum, h) => sum + (h.total_beds || 0), 0)

  const regions = {}
  hospitals.forEach((h) => {
    if (!h.hrr_city) return
    if (!regions[h.hrr_city]) regions[h.hrr_city] = { name: h.hrr_city, count: 0, icuBeds: 0, generalBeds: 0 }
    regions[h.hrr_city].count += 1
    regions[h.hrr_city].icuBeds += h.total_icu_beds || 0
    regions[h.hrr_city].generalBeds += h.total_beds || 0
  })
  const sortedRegions = Object.values(regions).sort((a, b) =>
    regionSort === 'icu' ? b.icuBeds - a.icuBeds : b.generalBeds - a.generalBeds
  )
  const maxValue = Math.max(...sortedRegions.map((r) => (regionSort === 'icu' ? r.icuBeds : r.generalBeds)), 1)

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-ink/40 font-body mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="font-display font-semibold text-2xl text-ink">
          Welcome back{auth?.role === 'staff' ? ' to your ward' : ''}
        </h1>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Hospitals in network" value={hospitals.length} icon={Building2} tone="teal" />
        <StatCard label="Total bed capacity" value={totalBeds.toLocaleString()} icon={Bed} tone="sage" />
        <StatCard label="Total ICU capacity" value={totalIcuBeds.toLocaleString()} icon={Activity} tone="amber" />
        <StatCard label="Referral regions" value={Object.keys(regions).length} icon={MapPin} tone="coral" />
      </div>

      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-semibold text-ink">Regional network capacity</h2>
            <p className="text-sm text-ink/40 font-body">
              ICU and general bed capacity across all {sortedRegions.length} referral regions
            </p>
          </div>
          <div className="flex gap-1 bg-ink/5 rounded-lg p-1">
            <button
              onClick={() => setRegionSort('icu')}
              className={`px-3 py-1.5 text-xs font-medium font-body rounded-md transition-colors ${
                regionSort === 'icu' ? 'bg-white text-teal shadow-sm' : 'text-ink/50'
              }`}
            >
              Sort by ICU
            </button>
            <button
              onClick={() => setRegionSort('general')}
              className={`px-3 py-1.5 text-xs font-medium font-body rounded-md transition-colors ${
                regionSort === 'general' ? 'bg-white text-amber shadow-sm' : 'text-ink/50'
              }`}
            >
              Sort by general beds
            </button>
          </div>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {sortedRegions.map((region) => {
            const barValue = regionSort === 'icu' ? region.icuBeds : region.generalBeds
            return (
              <div key={region.name} className="flex items-center gap-4">
                <div className="w-32 shrink-0">
                  <p className="text-sm font-medium text-ink font-body truncate">{region.name}</p>
                  <p className="text-xs text-ink/40 font-body">{region.count} hospitals</p>
                </div>
                <div className="flex-1 h-2.5 bg-ink/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      regionSort === 'icu' ? 'bg-teal' : 'bg-amber'
                    }`}
                    style={{ width: `${(barValue / maxValue) * 100}%` }}
                  />
                </div>
                <div className="w-44 text-right shrink-0 font-body">
                  <span className="font-mono text-sm text-ink/70">{region.icuBeds.toLocaleString()}</span>
                  <span className="text-xs text-ink/40"> ICU · </span>
                  <span className="font-mono text-sm text-ink/70">{region.generalBeds.toLocaleString()}</span>
                  <span className="text-xs text-ink/40"> general</span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-ink">Hospitals</h2>
        <Link to="/hospitals" className="text-sm text-teal hover:text-teal-deep font-medium font-body">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {hospitals.slice(0, 6).map((h) => (
          <Link key={h.hospital_id} to={`/hospitals/${h.hospital_id}`}>
            <Card className="p-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer h-full">
              <p className="font-medium text-ink font-body text-sm mb-1 truncate">{h.name}</p>
              <p className="text-xs text-ink/40 font-body mb-3">
                {h.city}, {h.state}
              </p>
              <div className="flex gap-2">
                <Badge tone="teal">{h.total_beds ?? '—'} beds</Badge>
                <Badge tone="amber">{h.total_icu_beds ?? '—'} ICU</Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
