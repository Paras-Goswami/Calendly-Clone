// src/hooks/useEventTypes.js
import { useState, useCallback } from 'react';
import { eventTypesApi } from '../services/api';
import { getErrorMessage } from '../utils/helpers';

export const useEventTypes = () => {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ FETCH
  const fetchEventTypes = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await eventTypesApi.getAll();

    // ✅ FIX: Ensure it's always an array
    const data = Array.isArray(response.data)
      ? response.data
      : response.data.items || [];

    console.log("✅ FETCHED DATA:", data);

    setEventTypes(data);

  } catch (err) {
    console.log("❌ FETCH ERROR:", err.response?.data);
    setError(getErrorMessage(err));
    setEventTypes([]);
  } finally {
    setLoading(false);
  }
}, []);

  // ✅ CREATE (YOUR FIXED FUNCTION)
  const createEventType = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: data.title.trim(),
        duration_minutes: Number(data.duration),
        description: data.description || "",
        is_active: true,
      };

      console.log("✅ FINAL PAYLOAD:", payload);

      const response = await eventTypesApi.create(payload);

      setEventTypes(prev => [...prev, response.data]);

      return response.data;

    } catch (err) {
      console.log("❌ BACKEND ERROR:", err.response?.data);

      if (err.response?.data?.detail) {
        console.table(err.response.data.detail);
      }

      setError(getErrorMessage(err));
      throw err;

    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE
  const deleteEventType = async (id) => {
    setLoading(true);
    setError(null);

    try {
      await eventTypesApi.delete(id);
      setEventTypes(prev => prev.filter(et => et.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    eventTypes,
    loading,
    error,
    fetchEventTypes,
    createEventType,
    deleteEventType
  };
};