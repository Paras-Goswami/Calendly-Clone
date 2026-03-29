// src/components/booking/TimeSlotPicker.jsx
import React from 'react';
import Button from '../ui/Button';
import { formatTime } from '../../utils/dateUtils';

const TimeSlotPicker = ({ date, slots, selectedSlot, onSelectSlot }) => {
  if (!date) return null;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col h-full max-h-[400px]">
      <div className="mb-4">
        <h3 className="text-gray-500 text-sm font-medium">Available times for</h3>
        <p className="text-lg font-semibold text-gray-900">
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {slots.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300 p-6 text-center">
          <p className="text-gray-500 text-sm">No available slots on this date.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {slots.map((slot, index) => {
            const isSelected = selectedSlot === slot;
            return (
              <div key={index} className="flex gap-2">
                <Button
                  variant={isSelected ? 'primary' : 'outline'}
                  className={`w-full py-3 text-lg font-medium transition-all ${
                    isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:border-blue-500 hover:text-blue-600'
                  }`}
                  onClick={() => onSelectSlot(slot)}
                >
                  {formatTime(slot)}
                </Button>
                {isSelected && (
                  <Button 
                    variant="primary" 
                    className="w-1/2 whitespace-nowrap bg-blue-700 hover:bg-blue-800 animate-fade-in-right"
                    onClick={() => onSelectSlot(slot, true)} // A boolean flag to confirm selection
                  >
                    Confirm
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;