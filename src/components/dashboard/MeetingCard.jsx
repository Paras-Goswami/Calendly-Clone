// src/components/dashboard/MeetingCard.jsx
import React from 'react';
import { Card, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatDate, formatTime } from '../../utils/dateUtils';

const MeetingCard = ({ meeting, onCancel, isPast = false }) => {
  // ✅ Safety Check: Use optional chaining to prevent crashes
  const isCanceled = meeting?.status === 'canceled';

  return (
    <Card className={`mb-4 ${isCanceled ? 'opacity-75' : ''}`}>
      <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* Date and Time Block */}
        <div className="flex items-center gap-4 min-w-[200px]">
          <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-center min-w-[80px]">
            {/* ✅ Added ?. for safety */}
            <div className="text-xs font-bold uppercase">
              {meeting?.start_time ? formatDate(meeting.start_time, 'MMM') : '---'}
            </div>
            <div className="text-2xl font-bold">
              {meeting?.start_time ? formatDate(meeting.start_time, 'd') : '--'}
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {meeting?.start_time ? formatTime(meeting.start_time) : 'No time'} - {meeting?.end_time ? formatTime(meeting.end_time) : ''}
            </div>
            {/* ✅ CRITICAL FIX: event_type might be null if it was deleted */}
            <div className="text-sm text-gray-500">
              {meeting?.event_type?.title || 'Unknown Event Type'}
            </div>
          </div>
        </div>

        {/* Invitee Details */}
        <div className="flex-1">
          <div className="font-medium text-gray-900">{meeting?.invitee_name || 'Anonymous'}</div>
          <div className="text-sm text-gray-500">{meeting?.invitee_email || 'No email provided'}</div>
          {meeting?.notes && (
            <div className="text-sm text-gray-600 mt-1 italic line-clamp-2">
              "{meeting.notes}"
            </div>
          )}
        </div>

        {/* Status and Actions */}
        <div className="flex flex-col items-end gap-2 min-w-[100px]">
          {isCanceled ? (
            <Badge variant="danger">Canceled</Badge>
          ) : isPast ? (
            <Badge variant="gray">Completed</Badge>
          ) : (
            <Badge variant="success">Upcoming</Badge>
          )}

          {!isPast && !isCanceled && onCancel && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onCancel(meeting)}
              className="text-red-600 border-red-200 hover:bg-red-50 mt-2"
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MeetingCard;