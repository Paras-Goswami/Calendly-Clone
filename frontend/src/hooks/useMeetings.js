// src/hooks/useMeetings.js
import { useState, useCallback } from 'react';
import { meetingsApi } from '../services/api';
import { getErrorMessage } from '../utils/helpers';

export const useMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUpcoming = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await meetingsApi.getUpcoming();
      // ✅ FIX: Handle paginated data
      const data = Array.isArray(response.data) ? response.data : (response.data.items || []);
      setMeetings(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPast = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await meetingsApi.getPast();
      // ✅ FIX: Handle paginated data
      const data = Array.isArray(response.data) ? response.data : (response.data.items || []);
      setMeetings(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelMeeting = async (meetingId) => {
    setLoading(true);
    setError(null);
    try {
      await meetingsApi.cancelMeeting(meetingId);
      setMeetings(prev => prev.filter(m => m.id !== meetingId));
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { meetings, loading, error, fetchUpcoming, fetchPast, cancelMeeting };
};