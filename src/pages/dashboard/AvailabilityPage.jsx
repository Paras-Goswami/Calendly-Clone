// src/pages/dashboard/AvailabilityPage.jsx
import React, { useEffect, useState } from 'react';
import { useAvailability } from '../../hooks/useAvailability';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { Card, CardContent } from '../../components/ui/Card';
import { DAYS_OF_WEEK } from '../../constants';

const AvailabilityPage = () => {
  const { rules, loading, error, fetchRules, updateRules } = useAvailability();
  const [schedule, setSchedule] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize schedule with default 9-5 for weekdays if no rules exist yet
  useEffect(() => {
    fetchRules().then((data) => {
      if (data && data.schedule) {
        setSchedule(data.schedule);
      } else {
        const defaultSchedule = {};
        DAYS_OF_WEEK.forEach((day, index) => {
          // Default to Mon-Fri, 09:00 to 17:00
          const isWeekday = index > 0 && index < 6;
          defaultSchedule[day] = {
            is_available: isWeekday,
            start_time: isWeekday ? '09:00' : '',
            end_time: isWeekday ? '17:00' : ''
          };
        });
        setSchedule(defaultSchedule);
      }
    });
  }, [fetchRules]);

  const handleToggleDay = (day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        is_available: !prev[day].is_available
      }
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage('');
    try {
      await updateRules({ schedule });
      setSuccessMessage('Availability updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save availability', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && Object.keys(schedule).length === 0) return <Loader center />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Availability</h1>
          <p className="mt-1 text-sm text-gray-500">Set your regular weekly hours.</p>
        </div>
        <Button onClick={handleSave} isLoading={isSaving}>Save Changes</Button>
      </div>

      {error && <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">{error}</div>}
      {successMessage && <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-md">{successMessage}</div>}

      <Card>
        <CardContent className="divide-y divide-gray-200 p-0">
          {DAYS_OF_WEEK.map((day) => {
            const dayData = schedule[day] || { is_available: false, start_time: '', end_time: '' };
            
            return (
              <div key={day} className="flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center w-1/3">
                  <input
                    type="checkbox"
                    checked={dayData.is_available}
                    onChange={() => handleToggleDay(day)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">{day}</span>
                </div>

                <div className="flex-1 flex items-center space-x-4">
                  {dayData.is_available ? (
                    <>
                      <input
                        type="time"
                        value={dayData.start_time}
                        onChange={(e) => handleTimeChange(day, 'start_time', e.target.value)}
                        className="block w-full sm:w-32 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="time"
                        value={dayData.end_time}
                        onChange={(e) => handleTimeChange(day, 'end_time', e.target.value)}
                        className="block w-full sm:w-32 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </>
                  ) : (
                    <span className="text-sm text-gray-500 italic">Unavailable</span>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailabilityPage;