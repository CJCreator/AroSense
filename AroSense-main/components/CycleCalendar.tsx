import React, { useState, useEffect } from 'react';
import type { MenstrualCycle, FertilityWindow } from '../types/phase2Types';

interface CycleCalendarProps {
  cycles: MenstrualCycle[];
  fertilityWindows: FertilityWindow[];
  onDateClick?: (date: Date) => void;
}

const CycleCalendar: React.FC<CycleCalendarProps> = ({ cycles, fertilityWindows, onDateClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentMonth]);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    setCalendarDays(days);
  };

  const getDayStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Check if it's a period day
    const periodDay = cycles.some(cycle => {
      const startDate = cycle.start_date;
      const endDate = cycle.end_date;
      if (!endDate) return dateStr === startDate;
      return dateStr >= startDate && dateStr <= endDate;
    });

    // Check if it's a fertile day
    const fertileDay = fertilityWindows.some(window => {
      return dateStr >= window.fertile_start && dateStr <= window.fertile_end;
    });

    // Check if it's ovulation day
    const ovulationDay = fertilityWindows.some(window => {
      return window.ovulation_date === dateStr;
    });

    if (ovulationDay) return 'ovulation';
    if (periodDay) return 'period';
    if (fertileDay) return 'fertile';
    return 'normal';
  };

  const getDayClasses = (date: Date, status: string) => {
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const isToday = date.toDateString() === new Date().toDateString();
    
    let classes = 'w-10 h-10 flex items-center justify-center text-sm rounded-full cursor-pointer transition-colors ';
    
    if (!isCurrentMonth) {
      classes += 'text-gray-300 ';
    } else {
      classes += 'text-gray-700 hover:bg-gray-100 ';
    }
    
    if (isToday) {
      classes += 'ring-2 ring-blue-500 ';
    }
    
    switch (status) {
      case 'period':
        classes += 'bg-red-500 text-white hover:bg-red-600 ';
        break;
      case 'fertile':
        classes += 'bg-green-200 text-green-800 hover:bg-green-300 ';
        break;
      case 'ovulation':
        classes += 'bg-pink-500 text-white hover:bg-pink-600 ';
        break;
    }
    
    return classes;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          ←
        </button>
        <h3 className="text-lg font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          →
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const status = getDayStatus(date);
          return (
            <button
              key={index}
              onClick={() => onDateClick?.(date)}
              className={getDayClasses(date, status)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span>Period</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-200 rounded-full"></div>
          <span>Fertile Window</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
          <span>Ovulation</span>
        </div>
      </div>
    </div>
  );
};

export default CycleCalendar;