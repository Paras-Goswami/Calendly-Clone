// src/components/booking/BookingForm.jsx
import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { formatDate, formatTime } from '../../utils/dateUtils';

const BookingForm = ({ eventType, selectedDate, selectedSlot, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Details</h2>
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex flex-col gap-1 text-blue-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{eventType.title}</span>
            <span className="text-blue-400">•</span>
            <span>{eventType.duration} mins</span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <span>📅 {formatDate(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <span>⏰ {formatTime(selectedSlot)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="John Doe"
        />

        <Input
          type="email"
          label="Email *"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="john@example.com"
        />

        <Input
          as="textarea"
          label="Please share anything that will help prepare for our meeting"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
        />

        <div className="pt-4 flex gap-3">
          <Button type="submit" variant="primary" className="flex-1" isLoading={isLoading}>
            Schedule Event
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;