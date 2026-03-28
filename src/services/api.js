// src/services/api.js
import axios from 'axios';
import { API_BASE_URL } from '../constants';

// ✅ Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL || "http://127.0.0.1:8000",
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // ⏱ prevents hanging requests
});

// ✅ REQUEST INTERCEPTOR (for future auth)
apiClient.interceptors.request.use(
  (config) => {
    // Example if you add auth later:
    // const token = localStorage.getItem("token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR (VERY IMPORTANT)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API ERROR:", error.response?.data || error.message);

    // 🔥 Show validation errors clearly (FastAPI)
    if (error.response?.data?.detail) {
      console.table(error.response.data.detail);
    }

    return Promise.reject(error);
  }
);

// ================= EVENT TYPES =================
export const eventTypesApi = {
  getAll: () => apiClient.get('/event-types/'),

  getBySlug: (slug) =>
    apiClient.get(`/event-types/${slug}/`),

  create: (data) =>
    apiClient.post('/event-types/', data),

  update: (id, data) =>
    apiClient.patch(`/event-types/${id}/`, data),

  delete: (id) =>
    apiClient.delete(`/event-types/${id}/`),
};

// ================= AVAILABILITY =================
export const availabilityApi = {
  getRules: () =>
    apiClient.get('/availability/'),

  updateRules: (data) =>
    apiClient.put('/availability/bulk/', data),

  getAvailableSlots: (date, eventTypeId) => 
  apiClient.get('/availability/slots/', { 
    params: { 
      date,
      event_type_id: eventTypeId  // ✅ FIXED
    } 
  }),
};

// ================= BOOKINGS =================
export const bookingApi = {
  createBooking: (data) =>
    apiClient.post('/booking/', data),

  getConfirmation: (bookingId) =>
    apiClient.get(`/booking/${bookingId}/confirm/`),
};

// ================= MEETINGS =================
export const meetingsApi = {
  getUpcoming: () =>
    apiClient.get('/meetings/upcoming/'),

  getPast: () =>
    apiClient.get('/meetings/past/'),

  cancelMeeting: (meetingId) =>
    apiClient.post(`/meetings/${meetingId}/cancel/`),
};

export default apiClient;