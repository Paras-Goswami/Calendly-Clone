// src/components/dashboard/EventTypeModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { DURATIONS } from '../../constants';

const EventTypeModal = ({ isOpen, onClose, onSave, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
  });

  // ✅ FIXED: Proper mapping for edit mode
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.name || '',                    // ✅ backend → frontend mapping
        description: initialData.description || '',
        duration: initialData.duration_minutes || 30,     // ✅ mapping
      });
    } else {
      setFormData({
        title: '',
        description: '',
        duration: 30,
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Event Type' : 'New Event Type'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <Input
          label="Event Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="e.g., 30 Minute Discovery Call"
        />

        <Input
          as="select"
          label="Duration"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
        >
          {DURATIONS.map(dur => (
            <option key={dur} value={dur}>
              {dur} minutes
            </option>
          ))}
        </Input>

        <Input
          as="textarea"
          label="Description (Optional)"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Let invitees know what this meeting is about..."
        />

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>

          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialData ? 'Save Changes' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EventTypeModal;