// src/components/booking/Calendar.jsx
import React, { useState } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, 
  isBefore, startOfDay, parseISO 
} from 'date-fns';

const Calendar = ({ availableDates = [], selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Calendar Header (Month/Year & Navigation)
  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    );
  };

  // Days of the week row (Sun, Mon, Tue...)
  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center font-medium text-sm text-gray-500 py-2" key={i}>
          {format(addDays(startDate, i), 'EEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  // The actual days grid
  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const dateString = format(cloneDay, 'yyyy-MM-dd');
        
        // Logic for disabling days
        const isPast = isBefore(cloneDay, startOfDay(new Date()));
        const isAvailable = availableDates.includes(dateString);
        const isSelected = selectedDate && isSameDay(cloneDay, selectedDate);
        const isDisabled = isPast || !isAvailable;

        days.push(
          <div
            key={day}
            onClick={() => !isDisabled && onSelectDate(cloneDay)}
            className={`
              flex justify-center items-center h-12 w-12 mx-auto rounded-full text-sm cursor-pointer transition-colors
              ${!isSameMonth(day, monthStart) ? 'text-gray-300 pointer-events-none' : ''}
              ${isSelected ? 'bg-blue-600 text-white font-bold' : ''}
              ${!isSelected && !isDisabled ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium' : ''}
              ${!isSelected && isDisabled && isSameMonth(day, monthStart) ? 'text-gray-400 cursor-not-allowed' : ''}
            `}
          >
            {formattedDate}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1 mb-1" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 select-none">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default Calendar;