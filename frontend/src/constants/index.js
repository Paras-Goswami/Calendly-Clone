// src/constants/index.js

// Changed localhost to 127.0.0.1 to fix Windows connection drops
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const DURATIONS = [15, 30, 45, 60, 90, 120];