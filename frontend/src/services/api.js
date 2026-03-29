// src/services/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// INTERCEPTORS
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API ERROR:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
// ================= MEETINGS =================
export const meetingsApi = {
  getUpcoming: () =>
    apiClient.get('/meetings/upcoming/'),

  getPast: () =>
    apiClient.get('/meetings/past/'),

  cancelMeeting: (meetingId) =>
    apiClient.post(`/meetings/${meetingId}/cancel/`),
};
// ================= EVENT TYPES =================
export const eventTypesApi = {
  getAll: () => apiClient.get('/event-types/'),

  // ✅ CORRECT
  getBySlug: (slug) =>
    apiClient.get(`/event-types/slug/${slug}`),

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

  // ✅ IMPORTANT FIX: use SLUG (not ID)
  getAvailableSlots: (slug, date) =>
    apiClient.get(`/availability/slots/${slug}`, {
      params: { date },
    }),
};

// ================= BOOKINGS =================
export const bookingApi = {
  createBooking: (slug, data) =>
    apiClient.post(`/booking/${slug}/`, data),

  getConfirmation: (bookingId) =>
    apiClient.get(`/booking/${bookingId}/confirm/`),
};

export default apiClient;