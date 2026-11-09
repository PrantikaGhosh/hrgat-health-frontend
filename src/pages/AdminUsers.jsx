import { useEffect, useState } from 'react'
import { Plus, Trash2, Shield, User } from 'lucide-react'
import { usersApi, hospitalsApi } from '../api'
import { Card, Badge, Button, PageLoader, Modal, Input, Select } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const EMPTY_FORM = { new_user_email: '', role: 'staff', hospital_id: '' }

export default function AdminUsers() {
  const { auth } = useAuth()
  const { showToast } = useToast()
  const [users, setUsers] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [hospitalSearch, setHospitalSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const loadUsers = () => {
    usersApi
      .list()
      .then(({ data }) => {
        setUsers(data.users)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers()
    hospitalsApi.list().then(({ data }) => setHospitals(data.hospitals))
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (form.role === 'staff' && !form.hospital_id) {
      showToast('Choose a hospital for this staff account', 'error')
      return
    }
    setSaving(true)
    try {
      await usersApi.create({
        new_user_email: form.new_user_email,
        role: form.role,
        hospital_id: form.role === 'staff' ? Number(form.hospital_id) : null,
      })
      showToast('Account created')
      setShowAdd(false)
      setForm(EMPTY_FORM)
      setHospitalSearch('')
      loadUsers()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Could not create account', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (userId) => {
    if (userId === auth.user_id) {
      showToast('You cannot remove your own account', 'error')
      return
    }
    try {
      await usersApi.remove(userId)
      showToast('Account removed')
      loadUsers()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Could not remove account', 'error')
    }
  }

  const hospitalName = (id) => hospitals.find((h) => h.hospital_id === id)?.name || `#${id}`

  if (loading) return <PageLoader />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink">Team</h1>
          <p className="text-sm text-ink/40 font-body mt-1">{users.length} accounts with system access</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add account
        </Button>
      </div>

      <Card className="divide-y divide-ink/[0.06]">
        {users.map((u) => (
          <div key={u.user_id} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  u.role === 'admin' ? 'bg-amber/10 text-amber' : 'bg-teal-light text-teal'
                }`}
              >
                {u.role === 'admin' ? <Shield size={15} /> : <User size={15} />}
              </div>
              <div>
                <p className="font-medium text-ink font-body text-sm">{u.email}</p>
                <p className="text-xs text-ink/40 font-body">
                  {u.hospital_id ? hospitalName(u.hospital_id) : 'Network-wide access'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={u.role === 'admin' ? 'amber' : 'teal'}>{u.role}</Badge>
              {u.user_id !== auth.user_id && (
                <button onClick={() => handleRemove(u.user_id)} className="text-ink/30 hover:text-coral transition-colors">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add account">
        <form onSubmit={handleAdd}>
          <Input
            label="Email"
            type="email"
            required
            value={form.new_user_email}
            onChange={(e) => setForm({ ...form, new_user_email: e.target.value })}
          />
          <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </Select>
          {form.role === 'staff' && (
            <div className="mb-4">
              <span className="block text-xs font-medium text-ink/60 mb-1.5 font-body">Assigned hospital</span>
              {form.hospital_id ? (
                <div className="flex items-center justify-between bg-teal-light rounded-xl px-3.5 py-2.5">
                  <span className="text-sm text-teal-deep font-body truncate">
                    {hospitals.find((h) => h.hospital_id === Number(form.hospital_id))?.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, hospital_id: '' })}
                    className="text-xs font-medium text-teal-deep hover:underline shrink-0 ml-2"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <input
                    value={hospitalSearch}
                    onChange={(e) => setHospitalSearch(e.target.value)}
                    placeholder="Search hospitals..."
                    className="w-full rounded-xl border border-ink/10 px-3.5 py-2.5 text-sm font-body focus:border-teal focus:ring-1 focus:ring-teal outline-none mb-2"
                  />
                  <div className="max-h-48 overflow-y-auto border border-ink/10 rounded-xl">
                    {hospitals
                      .filter((h) => h.name.toLowerCase().includes(hospitalSearch.toLowerCase()))
                      .slice(0, 50)
                      .map((h) => (
                        <button
                          type="button"
                          key={h.hospital_id}
                          onClick={() => {
                            setForm({ ...form, hospital_id: String(h.hospital_id) })
                            setHospitalSearch('')
                          }}
                          className="w-full text-left px-3.5 py-2.5 text-sm font-body hover:bg-ink/[0.03] transition-colors border-b border-ink/[0.04] last:border-0"
                        >
                          {h.name}
                        </button>
                      ))}
                    {hospitals.filter((h) => h.name.toLowerCase().includes(hospitalSearch.toLowerCase())).length === 0 && (
                      <p className="text-sm text-ink/40 font-body text-center py-6">No hospitals found.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
          <Button type="submit" loading={saving} className="w-full mt-2">
            Create account
          </Button>
        </form>
      </Modal>
    </div>
  )
}
