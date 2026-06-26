import axios from 'axios';
import api from './api';
import { apiUrl } from './apiConfig';

const authClient = axios.create({
  baseURL: apiUrl(''),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await authClient.post('/login', { email, password });
    return response.data;
  }
};

export const studentApi = {
  getStudents: async () => {
    const response = await api.get('/students');
    return response.data;
  },
  getStudentById: async (id: string) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },
  createStudent: async (data: any) => {
    const response = await api.post('/students', data);
    return response.data;
  },
  updateStudent: async (id: string, data: any) => {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },
  deleteStudent: async (id: string) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  }
};

export const feeApi = {
  getFees: async () => {
    const response = await api.get('/fees');
    return response.data;
  },
  createFee: async (data: any) => {
    const response = await api.post('/fees', data);
    return response.data;
  },
  updateFee: async (id: string, data: any) => {
    const response = await api.put(`/fees/${id}`, data);
    return response.data;
  },
  markAdvancePayment: async (id: string, monthlyFee: number, advanceStartDate: string, isAdvance: boolean, advanceAmount?: number) => {
    const response = await api.post(`/fees/${id}/mark-advance`, {
      monthlyFee,
      advanceStartDate,
      isAdvance,
      advanceAmount
    });
    return response.data;
  },
  getStudentPaymentValidity: async (studentDisplayId: string) => {
    const response = await api.get(`/fees/student/${studentDisplayId}/validity`);
    return response.data;
  }
};

export const seatApi = {
  getSeats: async () => {
    const response = await api.get('/seats');
    return response.data;
  },
  getAvailableSeats: async () => {
    const response = await api.get('/seats/available');
    return response.data;
  },
  updateSeatStatus: async (id: string, data: any) => {
    const response = await api.put(`/seats/${id}`, data);
    return response.data;
  }
};

export const dashboardApi = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }
};

export const requestApi = {
  getRequests: async () => {
    const response = await api.get('/requests');
    return response.data;
  },
  updateRequestStatus: async (id: string, status: string) => {
    const response = await api.put(`/requests/${id}`, { status });
    return response.data;
  }
};

export const reportApi = {
  getReportsData: async (timeRange: string) => {
    const response = await api.get('/reports/data', { params: { timeRange } });
    return response.data;
  }
};

// Old code: const siteContentUrl = () => apiUrl('/api/site-content');
const siteContentUrl = () => '/site-content';

export const siteContentApi = {
  get: async () => {
    const response = await api.get(siteContentUrl());
    return response.data;
  },
  update: async (data: Record<string, unknown>) => {
    const response = await api.put(siteContentUrl(), data);
    return response.data;
  },
};

export const studentPortalApi = {
  getMyDetails: async () => {
    const response = await api.get('/student/me');
    return response.data;
  }
};

