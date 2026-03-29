import { useState, useCallback } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const useMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -----------------------------
  // FETCH UPCOMING
  // -----------------------------
  const fetchUpcoming = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${API_URL}/meetings/upcoming?page=1&page_size=20`
      );

      console.log("Upcoming meetings:", response.data);

      // CRITICAL FIX
      setMeetings(response.data.items || []);

    } catch (err) {
      console.error("Error fetching upcoming meetings:", err);
      setError(err);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------
  // FETCH PAST
  // -----------------------------
  const fetchPast = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${API_URL}/meetings/past?page=1&page_size=20`
      );

      console.log("Past meetings:", response.data);

      setMeetings(response.data.items || []);

    } catch (err) {
      console.error("Error fetching past meetings:", err);
      setError(err);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------
  // CANCEL
  // -----------------------------
  const cancelMeeting = async (id) => {
    try {
      await axios.put(`${API_URL}/meetings/${id}/cancel`);

      // refresh list
      await fetchUpcoming();

    } catch (err) {
      console.error("Cancel error:", err);
      throw err;
    }
  };

  return {
    meetings,
    loading,
    error,
    fetchUpcoming,
    fetchPast,
    cancelMeeting,
  };
};