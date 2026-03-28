// src/hooks/useAvailability.js
import { useState, useCallback } from 'react';
import { availabilityApi } from '../services/api';
import { getErrorMessage } from '../utils/helpers';

export const useAvailability = () => {
  const [rules, setRules] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await availabilityApi.getRules();
      setRules(response.data);
      return response.data;
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRules = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await availabilityApi.updateRules(data);
      setRules(response.data);
      return response.data;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (date, eventTypeId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await availabilityApi.getAvailableSlots(date, eventTypeId);
      setAvailableSlots(response.data.slots || []);
      return response.data.slots;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    rules,
    availableSlots,
    loading,
    error,
    fetchRules,
    updateRules,
    fetchAvailableSlots
  };
};