// src/utils/helpers.js

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w-]+/g, '')     // Remove all non-word chars
    .replace(/--+/g, '-');       // Replace multiple - with single -
};

export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours} hr ${remainingMins} mins` : `${hours} hr`;
};

export const getErrorMessage = (error) => {
  // Extracts error from FastAPI detail array if it exists
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    return Array.isArray(detail) ? detail[0].msg : detail;
  }
  return error.message || 'An unexpected error occurred';
};