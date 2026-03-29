// src/pages/public/ConfirmationPage.jsx
import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { formatDate, formatTime } from '../../utils/dateUtils';
import Button from '../../components/ui/Button';

const ConfirmationPage = () => {
  const location = useLocation();
  const { booking, eventType } = location.state || {};

  // If someone tries to navigate here directly without booking, redirect them
  if (!booking || !eventType) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You are scheduled!</h1>
        <p className="text-gray-600 mb-8">
          A calendar invitation has been sent to your email address.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 text-left border border-gray-200 mb-8">
          <h2 className="font-bold text-gray-900 mb-4">{eventType.title}</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <span className="mr-3 text-xl">👤</span>
              <span className="mt-0.5">{booking.invitee_name}</span>
            </div>
            <div className="flex items-start">
              <span className="mr-3 text-xl">📅</span>
              <span className="mt-0.5">
                {formatTime(booking.start_time)} - {formatTime(booking.end_time)}, <br/>
                {formatDate(booking.start_time, 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>

        <Link to="/">
          <Button variant="outline" className="w-full">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ConfirmationPage;