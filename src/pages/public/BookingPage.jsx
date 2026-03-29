import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventTypesApi, availabilityApi, bookingApi } from '../../services/api';
import Calendar from '../../components/booking/Calendar';
import TimeSlotPicker from '../../components/booking/TimeSlotPicker';
import BookingForm from '../../components/booking/BookingForm';
import Loader from '../../components/ui/Loader';
import { toDateString, formatDate } from '../../utils/dateUtils';
import { getErrorMessage } from '../../utils/helpers';

const BookingPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [eventType, setEventType] = useState(null);
  const [loadingType, setLoadingType] = useState(true);
  const [error, setError] = useState(null);

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [monthAvailableDates, setMonthAvailableDates] = useState([]);

  // ================= FETCH EVENT =================
  useEffect(() => {
    const fetchEventType = async () => {
      try {
        const response = await eventTypesApi.getBySlug(slug);
        setEventType(response.data);

        // Mock dates
        const dates = [];
        for (let i = 1; i <= 30; i++) {
          const d = new Date();
          d.setDate(d.getDate() + i);

          if (d.getDay() !== 0 && d.getDay() !== 6) {
            dates.push(toDateString(d));
          }
        }
        setMonthAvailableDates(dates);

      } catch (err) {
        console.error("❌ Error fetching event:", err.response?.data);
        setError('This scheduling page does not exist or is unavailable.');
      } finally {
        setLoadingType(false);
      }
    };

    fetchEventType();
  }, [slug]);

  // ================= DATE SELECT =================
  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setStep(2);
    setLoadingSlots(true);
    setSelectedSlot(null);
    setError(null);

    try {
      const formattedDate = toDateString(date);

      // ✅ FIXED: use slug
      const response = await availabilityApi.getAvailableSlots(
        slug,
        formattedDate
      );

      console.log("SLOTS:", response.data);

      setAvailableSlots(response.data);

    } catch (err) {
      console.error('❌ Failed to fetch slots', err.response?.data);
      setAvailableSlots([]);
      setError("Failed to load time slots. Try again.");
    } finally {
      setLoadingSlots(false);
    }
  };

  // ================= SLOT SELECT =================
  const handleSlotSelect = (time, confirm = false) => {
    setSelectedSlot(time);
    if (confirm) setStep(3);
  };

  // ================= BOOKING =================
  const handleBookingSubmit = async (formData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formattedDate = toDateString(selectedDate);

      const formattedTime =
        selectedSlot.length === 5
          ? `${selectedSlot}:00`
          : selectedSlot;

      const payload = {
        date: formattedDate,
        start_time: formattedTime,
        invitee_name: formData.name.trim(),
        invitee_email: formData.email.trim(),
        notes: formData.notes || ""
      };

      const response = await bookingApi.createBooking(slug, payload);

      navigate('/confirmation', {
        state: {
          booking: response.data,
          eventType
        }
      });

    } catch (err) {
      console.error("❌ Booking error:", err.response?.data);

      if (err.response?.status === 409) {
        setError("⚠️ Slot already booked. Choose another.");
        setStep(2);
      } else {
        setError(getErrorMessage(err));
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= UI =================

  if (loadingType) {
    return <Loader />;
  }

  if (error && !eventType) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {step === 1 && (
        <Calendar
          availableDates={monthAvailableDates}
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
        />
      )}

      {step === 2 && (
        <TimeSlotPicker
          date={selectedDate}
          slots={availableSlots}
          selectedSlot={selectedSlot}
          onSelectSlot={handleSlotSelect}
        />
      )}

      {step === 3 && (
        <BookingForm
          eventType={eventType}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          onSubmit={handleBookingSubmit}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default BookingPage;