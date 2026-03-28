// src/pages/dashboard/MeetingsPage.jsx
import React, { useEffect, useState } from 'react';
import { useMeetings } from '../../hooks/useMeetings';
import MeetingCard from '../../components/dashboard/MeetingCard';
import Tabs from '../../components/ui/Tabs';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const MeetingsPage = () => {
  const { meetings, loading, error, fetchUpcoming, fetchPast, cancelMeeting } = useMeetings();
  const [activeTab, setActiveTab] = useState('upcoming');
  
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [meetingToCancel, setMeetingToCancel] = useState(null);
  const [isCanceling, setIsCanceling] = useState(false);

  useEffect(() => {
    if (activeTab === 'upcoming') {
      fetchUpcoming();
    } else {
      fetchPast();
    }
  }, [activeTab, fetchUpcoming, fetchPast]);

  const executeCancel = async () => {
    if (!meetingToCancel) return;
    setIsCanceling(true);
    try {
      await cancelMeeting(meetingToCancel.id);
      setIsCancelDialogOpen(false);
      setMeetingToCancel(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCanceling(false);
    }
  };

  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Scheduled Meetings</h1>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {loading ? <Loader center /> : (
        <div className="space-y-4">
          {meetings && Array.isArray(meetings) && meetings.length > 0 ? (
            meetings.map((m) => (
              <MeetingCard 
                key={m.id} 
                meeting={m} 
                isPast={activeTab === 'past'} 
                onCancel={(meeting) => {
                  setMeetingToCancel(meeting);
                  setIsCancelDialogOpen(true);
                }}
              />
            ))
          ) : (
            <EmptyState title="No meetings found" description="Your scheduled slots will appear here." />
          )}
        </div>
      )}

      <ConfirmDialog 
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={executeCancel}
        title="Cancel Meeting"
        message="Are you sure you want to cancel this meeting?"
        isLoading={isCanceling}
      />
    </div>
  );
};

export default MeetingsPage;