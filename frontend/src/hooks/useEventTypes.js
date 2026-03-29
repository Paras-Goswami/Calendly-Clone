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

      // ✅ Always ensure array
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.items || [];

      console.log("✅ FETCHED DATA:", data);

      setEventTypes(data);
      return data;

    } catch (err) {
      console.log("❌ FETCH ERROR:", err.response?.data);
      setError(getErrorMessage(err));
      setEventTypes([]);
      throw err;

    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ CREATE
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

      console.log("✅ CREATE PAYLOAD:", payload);

      const response = await eventTypesApi.create(payload);

      // ✅ Add to UI instantly
      setEventTypes(prev => [...prev, response.data]);

      return response.data;

    } catch (err) {
      console.log("❌ CREATE ERROR:", err.response?.data);

      if (err.response?.data?.detail) {
        console.table(err.response.data.detail);
      }

      setError(getErrorMessage(err));
      throw err;

    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATE (🔥 NEW FEATURE)
  const updateEventType = async (id, data) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: data.title.trim(),
        duration_minutes: Number(data.duration),
        description: data.description || "",
        is_active: true,
      };

      console.log("🟡 UPDATE PAYLOAD:", payload);

      const response = await eventTypesApi.update(id, payload);

      // ✅ Update UI instantly
      setEventTypes(prev =>
        prev.map(et => (et.id === id ? response.data : et))
      );

      return response.data;

    } catch (err) {
      console.log("❌ UPDATE ERROR:", err.response?.data);

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

      // ✅ Remove from UI instantly
      setEventTypes(prev => prev.filter(et => et.id !== id));

    } catch (err) {
      console.log("❌ DELETE ERROR:", err.response?.data);
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
    updateEventType, // ✅ NEW
    deleteEventType
  };
};