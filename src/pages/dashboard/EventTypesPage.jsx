// src/pages/dashboard/EventTypesPage.jsx
import React, { useEffect, useState } from 'react';
import { useEventTypes } from '../../hooks/useEventTypes';
import EventTypeCard from '../../components/dashboard/EventTypeCard';
import EventTypeModal from '../../components/dashboard/EventTypeModal';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const EventTypesPage = () => {
  const {
    eventTypes,
    loading,
    error,
    fetchEventTypes,
    createEventType,
    updateEventType,   // ✅ ADDED
    deleteEventType
  } = useEventTypes();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEventTypes();
  }, [fetchEventTypes]);

  const handleOpenModal = (event = null) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  // ✅ FINAL SAVE (CREATE + EDIT)
  const handleSave = async (data) => {
    try {
      if (!data.title || !data.duration) {
        alert("Title and Duration are required");
        return;
      }

      const cleanedData = {
        title: data.title.trim(),
        duration: Number(data.duration),
        description: data.description?.trim() || "",
      };

      if (editingEvent) {
        // ✅ EDIT FLOW
        await updateEventType(editingEvent.id, cleanedData);
      } else {
        // ✅ CREATE FLOW
        await createEventType(cleanedData);
      }

      handleCloseModal();
      fetchEventTypes();

    } catch (err) {
      console.error('❌ Failed to save event type', err);
    }
  };

  const confirmDelete = (event) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!eventToDelete) return;

    setIsDeleting(true);
    try {
      await deleteEventType(eventToDelete.id);
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (err) {
      console.error('❌ Failed to delete', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && eventTypes.length === 0) return <Loader center />;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Types</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage your booking pages.
          </p>
        </div>

        <Button onClick={() => handleOpenModal()}>
          + New Event Type
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {eventTypes.length === 0 && !loading ? (
        <EmptyState
          title="No event types yet"
          description="Create your first event type to allow people to book time with you."
          actionText="Create Event Type"
          onAction={() => handleOpenModal()}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {eventTypes.map((eventType) => (
            <EventTypeCard
              key={eventType.id}
              eventType={eventType}
              onEdit={handleOpenModal}   // ✅ already correct
              onDelete={confirmDelete}
            />
          ))}
        </div>
      )}

      <EventTypeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initialData={editingEvent}
        isLoading={loading}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={executeDelete}
        title="Delete Event Type"
        message={`Are you sure you want to delete "${eventToDelete?.title || eventToDelete?.name}"?`}
        confirmText="Yes, Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default EventTypesPage;