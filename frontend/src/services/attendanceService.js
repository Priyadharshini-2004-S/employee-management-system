import api from './api';

export const attendanceService = {
  checkIn: async () => {
    const response = await api.post('/attendance/checkin');
    return response.data;
  },

  checkOut: async () => {
    const response = await api.post('/attendance/checkout');
    return response.data;
  },

  getToday: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  },

  getMyHistory: async (month, year) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get('/attendance/my-history', { params });
    return response.data;
  },

  getMySummary: async (month, year) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get('/attendance/my-summary', { params });
    return response.data;
  },

  // Manager endpoints
  getAllAttendance: async (filters = {}) => {
    const response = await api.get('/attendance/all', { params: filters });
    return response.data;
  },

  getEmployeeAttendance: async (employeeId, filters = {}) => {
    const response = await api.get(`/attendance/employee/${employeeId}`, { params: filters });
    return response.data;
  },

  getTeamSummary: async (month, year) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get('/attendance/summary', { params });
    return response.data;
  },

  exportAttendance: async (filters = {}) => {
    const response = await api.get('/attendance/export', { 
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  getTodayStatus: async () => {
    const response = await api.get('/attendance/today-status');
    return response.data;
  }
};

