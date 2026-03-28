// src/components/dashboard/EventTypeCard.jsx
import React from 'react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { formatDuration } from '../../utils/helpers';

const EventTypeCard = ({ eventType, onEdit, onDelete }) => {
  const bookingUrl = `${window.location.origin}/book/${eventType.slug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bookingUrl);
    alert('Booking link copied to clipboard!');
  };

  return (
    <Card hoverable className="flex flex-col h-full">
      <CardContent className="flex-1">
        
        <div className="flex justify-between items-start mb-4">
          
          {/* ✅ FIXED: name instead of title */}
          <h3 className="text-lg font-bold text-gray-900">
            {eventType.name}
          </h3>

          {/* ✅ FIXED: duration_minutes */}
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {formatDuration(eventType.duration_minutes)}
          </span>

        </div>

        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {eventType.description || 'No description provided.'}
        </p>

        {/* ✅ FULL URL instead of just slug */}
        <div className="text-sm text-blue-600 break-all">
          {bookingUrl}
        </div>

      </CardContent>

      <CardFooter className="flex justify-between items-center bg-gray-50 py-3">
        
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="text-blue-600 hover:text-blue-800"
        >
          Copy Link
        </Button>

        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(eventType)}>
            Edit
          </Button>

          <Button variant="danger" size="sm" onClick={() => onDelete(eventType)}>
            Delete
          </Button>
        </div>

      </CardFooter>
    </Card>
  );
};

export default EventTypeCard;