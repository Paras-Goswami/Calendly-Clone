import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import DashboardLayout from './layouts/DashboardLayout';

import EventTypesPage from './pages/dashboard/EventTypesPage';
import AvailabilityPage from './pages/dashboard/AvailabilityPage';
import MeetingsPage from './pages/dashboard/MeetingsPage';

import BookingPage from './pages/public/BookingPage';
import ConfirmationPage from './pages/public/ConfirmationPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/event-types" replace />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/event-types" replace />} />
          <Route path="event-types" element={<EventTypesPage />} />
          <Route path="availability" element={<AvailabilityPage />} />
          <Route path="meetings" element={<MeetingsPage />} />
        </Route>

        <Route path="/book/:slug" element={<BookingPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;