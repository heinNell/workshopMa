'use client';

import { cn } from '@/lib/utils';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface DatePickerProps {
  label?: string;
  value?: string;
  onChange: (date: string) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
  disabled?: boolean;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function DatePicker({
  label,
  value,
  onChange,
  error,
  helperText,
  placeholder = 'Select date',
  minDate,
  maxDate,
  className,
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    return new Date();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDate = value ? new Date(value) : null;

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const days: Array<{ day: number; isCurrentMonth: boolean; date: Date }> = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month - 1, day),
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }
    
    // Next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }
    
    return days;
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    return false;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const handleSelectDate = (date: Date) => {
    const formatted = date.toISOString().split('T')[0];
    onChange(formatted);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const days = getDaysInMonth(viewDate);

  return (
    <div className={cn('w-full relative', className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-medium text-dark-300 mb-1">
          {label}
        </label>
      )}
      
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between gap-2',
          'bg-dark-900/80 border border-primary-500/20 rounded-lg px-3 py-2',
          'text-sm text-left transition-all duration-200',
          'hover:border-primary-500/40 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-danger-500/50',
          isOpen && 'border-primary-500/50 ring-2 ring-primary-500/20'
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Calendar className="w-4 h-4 text-primary-400 flex-shrink-0" />
          <span className={cn(
            'truncate',
            value ? 'text-white' : 'text-dark-500'
          )}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </div>
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="p-0.5 hover:bg-dark-700 rounded text-dark-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 w-[280px] bg-dark-900 border border-primary-500/20 rounded-xl shadow-2xl overflow-hidden animate-in">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-dark-700/50">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-white">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days Grid */}
          <div className="p-3">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-[10px] font-medium text-dark-500 uppercase tracking-wider py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-0.5">
              {days.map((day, index) => {
                const disabled = isDateDisabled(day.date);
                const today = isToday(day.date);
                const selected = isSelected(day.date);

                return (
                  <button
                    key={index}
                    type="button"
                    disabled={disabled || !day.isCurrentMonth}
                    onClick={() => handleSelectDate(day.date)}
                    className={cn(
                      'w-9 h-9 flex items-center justify-center rounded-lg text-xs font-medium transition-all',
                      !day.isCurrentMonth && 'text-dark-600 cursor-default',
                      day.isCurrentMonth && !disabled && 'hover:bg-primary-500/20 text-dark-200',
                      today && !selected && 'bg-primary-500/10 text-primary-400 ring-1 ring-primary-500/30',
                      selected && 'bg-primary-500 text-white hover:bg-primary-600',
                      disabled && day.isCurrentMonth && 'text-dark-600 cursor-not-allowed'
                    )}
                  >
                    {day.day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer - Quick Actions */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-dark-700/50 bg-dark-800/50">
            <button
              type="button"
              onClick={() => handleSelectDate(new Date())}
              className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-dark-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-[10px] text-danger-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-[10px] text-dark-400">{helperText}</p>
      )}
    </div>
  );
}
