import api from './api';

export const authService = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const contactService = {
  create: (payload) => api.post('/contacts', payload),
  list: (params) => api.get('/contacts', { params }),
  getOne: (id) => api.get(`/contacts/${id}`),
  updateStatus: (id, status) => api.patch(`/contacts/${id}/status`, { status }),
  remove: (id) => api.delete(`/contacts/${id}`),
  bulkDelete: (ids) => api.post('/contacts/bulk-delete', { ids }),
  exportRecords: ({ ids, format }) =>
    api.post('/contacts/export', { ids, format }, { responseType: 'blob' }),
  stats: () => api.get('/contacts/stats'),
};

export const contentService = {
  getAll: () => api.get('/content'),
};

export const staffService = {
  list: (params) => api.get('/staff', { params }),
  getOne: (id) => api.get(`/staff/${id}`),
  create: (payload) => api.post('/staff', payload),
  update: (id, payload) => api.put(`/staff/${id}`, payload),
  remove: (id, hard = false) => api.delete(`/staff/${id}`, { params: hard ? { hard: true } : {} }),
  regenerateQr: (id) => api.post(`/staff/${id}/regenerate-qr`),
  resetPassword: (id, password) => api.post(`/staff/${id}/reset-password`, { password }),
};

export const staffAuthService = {
  login: (payload) => api.post('/staff/login', payload),
  me: () => {
    const token = localStorage.getItem('kra_staff_token');
    return api.get('/staff/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
  logout: () => {
    const token = localStorage.getItem('kra_staff_token');
    return api.post(
      '/staff/logout',
      {},
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
  },
  today: () => {
    const token = localStorage.getItem('kra_staff_token');
    return api.get('/staff/attendance/today', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
  myHistory: (params) => {
    const token = localStorage.getItem('kra_staff_token');
    return api.get('/staff/attendance/my', {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
  scan: (payload) => {
    const token = localStorage.getItem('kra_staff_token');
    return api.post('/staff/attendance/scan', payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
};

export const biometricDeviceService = {
  list: () => api.get('/biometric-devices'),
  getOne: (id) => api.get(`/biometric-devices/${id}`),
  create: (payload) => api.post('/biometric-devices', payload),
  update: (id, payload) => api.put(`/biometric-devices/${id}`, payload),
  remove: (id) => api.delete(`/biometric-devices/${id}`),
  test: (id) => api.post(`/biometric-devices/${id}/test`),
  sync: (id) => api.post(`/biometric-devices/${id}/sync`),
  enroll: (id, payload) => api.post(`/biometric-devices/${id}/enroll`, payload),
  unenroll: (id, staffId) => api.delete(`/biometric-devices/${id}/enroll/${staffId}`),
  scan: (payload) => api.post('/biometric-devices/scan', payload),
};

export const attendanceService = {
  list: (params) => api.get('/attendance', { params }),
  today: () => api.get('/attendance/today'),
  history: (params) => api.get('/attendance/history', { params }),
  monthly: (params) => api.get('/attendance/monthly', { params }),
  stats: () => api.get('/attendance/stats'),
  mark: (payload) => api.post('/attendance/mark', payload),
  markQr: (qrPayload) => api.post('/attendance/qr', { qrPayload }),
  bulk: (payload) => api.post('/attendance/bulk', payload),
  update: (id, payload) => api.put(`/attendance/${id}`, payload),
  remove: (id) => api.delete(`/attendance/${id}`),
  export: (params) =>
    api.get('/attendance/export', { params, responseType: 'blob' }),
  officeQr: (params) => api.get('/attendance/office-qr', { params }),
  getLocation: () => api.get('/attendance/location'),
  saveLocation: (payload) => api.post('/attendance/location', payload),
};

export const financeService = {
  meta: () => api.get('/finance/meta'),
  settings: () => api.get('/finance/settings'),
  saveSettings: (payload) => api.put('/finance/settings', payload),
  dashboard: (params) => api.get('/finance/dashboard', { params }),
  reports: (params) => api.get('/finance/reports', { params }),
  transactions: (params) => api.get('/finance/transactions', { params }),
  export: (params) => api.get('/finance/export', { params, responseType: 'blob' }),

  salaries: (params) => api.get('/finance/salaries', { params }),
  setSalary: (payload) => api.post('/finance/salaries', payload),
  staffSalaryHistory: (staffId) => api.get(`/finance/salaries/staff/${staffId}`),

  salaryPayments: (params) => api.get('/finance/salary-payments', { params }),
  createSalaryPayment: (payload) => api.post('/finance/salary-payments', payload),
  deleteSalaryPayment: (id) => api.delete(`/finance/salary-payments/${id}`),

  income: (params) => api.get('/finance/income', { params }),
  createIncome: (payload) => api.post('/finance/income', payload),
  updateIncome: (id, payload) => api.put(`/finance/income/${id}`, payload),
  deleteIncome: (id) => api.delete(`/finance/income/${id}`),

  expenses: (params) => api.get('/finance/expenses', { params }),
  createExpense: (payload) => api.post('/finance/expenses', payload),
  updateExpense: (id, payload) => api.put(`/finance/expenses/${id}`, payload),
  deleteExpense: (id) => api.delete(`/finance/expenses/${id}`),
};
