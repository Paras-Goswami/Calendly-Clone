// src/pages/public/BookingPage.jsx
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

  // Booking flow
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
        const data = response.data;

        setEventType(data);

        // Mock available dates (next 30 weekdays)
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

    try {
      const formattedDate = new Date(date)
        .toISOString()
        .split("T")[0];

      console.log("📤 SLOT REQUEST:", {
        date: formattedDate,
        event_type_id: eventType.id
      });

      const response = await availabilityApi.getAvailableSlots(
        formattedDate,
        eventType.id
      );

      console.log("✅ SLOTS:", response.data);

      setAvailableSlots(response.data.slots || []);

    } catch (err) {
      console.error('❌ Failed to fetch slots', err.response?.data);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // ================= SLOT SELECT =================
  const handleSlotSelect = (time, confirm = false) => {
    setSelectedSlot(time);
    if (confirm) setStep(3);
  };

  // ================= BOOKING SUBMIT =================
  const handleBookingSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // ✅ DATE FIX
      const formattedDate = new Date(selectedDate)
        .toISOString()
        .split("T")[0];

      // ✅ TIME FIX (CRITICAL)
      const formattedTime =
        selectedSlot.length === 5
          ? `${selectedSlot}:00`
          : selectedSlot;

      const payload = {
        event_type_id: eventType.id,
        date: formattedDate,
        start_time: formattedTime,
        invitee_name: formData.name.trim(),
        invitee_email: formData.email.trim(),
        notes: formData.notes || ""
      };

      console.log("📤 BOOKING PAYLOAD:", payload);

      const response = await bookingApi.createBooking(payload);

      navigate('/confirmation', {
        state: {
          booking: response.data,
          eventType
        }
      });

    } catch (err) {
      console.error("❌ Booking error:", err.response?.data);
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= UI =================

  if (loadingType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="lg" />
      </div>
    );
  }

  if (error && !eventType) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border flex flex-col md:flex-row min-h-[500px]">

        {/* LEFT PANEL */}
        <div className="md:w-1/3 bg-gray-50 p-8 border-r">
          <div className="text-sm font-bold text-gray-500 uppercase mb-2">
            Paras Goswami
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {eventType.name}
          </h1>

          <div className="flex items-center text-gray-600 mb-4 font-medium">
            ⏱ {eventType.duration_minutes} min
          </div>

          {step > 1 && (
            <div className="text-blue-700 bg-blue-50 p-3 rounded-lg mb-4">
              <div>{formatDate(selectedDate, 'EEEE, MMMM d')}</div>
              {selectedSlot && <div>{selectedSlot}</div>}
            </div>
          )}

          <p className="text-gray-600">
            {eventType.description}
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="md:w-2/3 p-8">

          {error && step === 3 && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              <h2 className="text-xl font-bold mb-6 text-center">
                Select a Date
              </h2>

              <Calendar
                availableDates={monthAvailableDates}
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
              />
            </>
          )}

          {step === 2 && (
            <>
              <button onClick={() => setStep(1)}>← Back</button>

              {loadingSlots ? (
                <Loader center />
              ) : (
                <TimeSlotPicker
                  date={selectedDate}
                  slots={availableSlots}
                  selectedSlot={selectedSlot}
                  onSelectSlot={handleSlotSelect}
                />
              )}
            </>
          )}

          {step === 3 && (
            <>
              <button onClick={() => setStep(2)}>← Back</button>

              <BookingForm
                eventType={eventType}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onSubmit={handleBookingSubmit}
                isLoading={isSubmitting}
              />
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default BookingPage;