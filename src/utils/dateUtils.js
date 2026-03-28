// src/utils/dateUtils.js
import { format, parseISO, isBefore, startOfDay } from 'date-fns';

export const formatDate = (dateString, formatStr = 'MMMM d, yyyy') => {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, formatStr);
};

export const formatTime = (timeString) => {
  if (!timeString) return '';
  // Assumes backend sends 'HH:mm:ss' or similar ISO time
  const date = parseISO(`1970-01-01T${timeString}`);
  return format(date, 'h:mm a');
};

export const isPastDate = (date) => {
  return isBefore(date, startOfDay(new Date()));
};

export const toDateString = (date) => {
  return format(date, 'yyyy-MM-dd');
};