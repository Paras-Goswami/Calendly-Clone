// src/components/dashboard/EventTypeModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { DURATIONS } from '../../constants';

const EventTypeModal = ({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  isLoading = false
}) => {

  const defaultState = {
    title: '',
    description: '',
    duration: 30,
  };

  const [formData, setFormData] = useState(defaultState);

  // ✅ Sync form with edit / create mode
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.name || '',
          description: initialData.description || '',
          duration: initialData.duration_minutes || 30,
        });
      } else {
        setFormData(defaultState);
      }
    }
  }, [initialData, isOpen]);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? Number(value) : value
    }));
  };

  // ✅ Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    if (!formData.duration) {
      alert("Duration is required");
      return;
    }

    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Event Type' : 'New Event Type'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* TITLE */}
        <Input
          label="Event Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="e.g., 30 Minute Discovery Call"
        />

        {/* DURATION */}
        <Input
          as="select"
          label="Duration"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
        >
          {DURATIONS.map((dur) => (
            <option key={dur} value={dur}>
              {dur} minutes
            </option>
          ))}
        </Input>

        {/* DESCRIPTION */}
        <Input
          as="textarea"
          label="Description (Optional)"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Let invitees know what this meeting is about..."
        />

        {/* ACTIONS */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            {initialData ? 'Save Changes' : 'Create Event'}
          </Button>
        </div>

      </form>
    </Modal>
  );
};

export default EventTypeModal;