import client, { getAuthFields } from './client'

export const authApi = {
  loginRequest: (email) => client.post('/auth/login-request', { email }),
  verifyOtp: (email, otp) => client.post('/auth/verify-otp', { email, otp: Number(otp) }),
}

export const usersApi = {
  list: () => client.get('/admin/users', { params: getAuthFields() }),
  get: (id) => client.get(`/admin/users/${id}`, { params: getAuthFields() }),
  create: (data) => client.post('/admin/users', { ...getAuthFields(), ...data }),
  update: (id, data) => client.patch(`/admin/users/${id}`, { ...getAuthFields(), ...data }),
  remove: (id) => client.delete(`/admin/users/${id}`, { params: getAuthFields() }),
}

export const hospitalsApi = {
  list: () => client.get('/hospitals', { params: getAuthFields() }),
  get: (id) => client.get(`/hospitals/${id}`, { params: getAuthFields() }),
  neighbors: (id) => client.get(`/hospitals/${id}/neighbors`, { params: getAuthFields() }),
  transferOptions: (id) => client.get(`/hospitals/${id}/transfer-options`, { params: getAuthFields() }),
  byHrr: (hrrId) => client.get(`/hrr/${hrrId}/hospitals`, { params: getAuthFields() }),
  occupancy: (id) => client.get(`/hospitals/${id}/occupancy`, { params: getAuthFields() }),
  patients: (id) => client.get(`/hospitals/${id}/patients`, { params: getAuthFields() }),
  forecast: (id, target = 'icu') =>
    client.get(`/hospitals/${id}/forecast`, { params: { ...getAuthFields(), target } }),
  history: (id, target = 'icu', weeks = 26) =>
    client.get(`/hospitals/${id}/history`, { params: { ...getAuthFields(), target, weeks } }),
  create: (data) => client.post('/admin/hospitals', { ...getAuthFields(), ...data }),
  update: (id, data) => client.patch(`/admin/hospitals/${id}`, { ...getAuthFields(), ...data }),
  remove: (id) => client.delete(`/admin/hospitals/${id}`, { params: getAuthFields() }),
}

export const patientsApi = {
  get: (id) => client.get(`/patients/${id}`, { params: getAuthFields() }),
}

export const admissionsApi = {
  admit: (data) => client.post('/admissions', { ...getAuthFields(), ...data }),
  discharge: (id) => client.post(`/admissions/${id}/discharge`, { ...getAuthFields() }),
  transfer: (id, destinationHospitalId, bedType) =>
    client.post(`/admissions/${id}/transfer`, {
      ...getAuthFields(),
      destination_hospital_id: destinationHospitalId,
      bed_type: bedType,
    }),
}

export const forecastApi = {
  all: (target = 'icu') => client.get('/forecast/all', { params: { ...getAuthFields(), target } }),
}
