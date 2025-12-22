import { useState, useRef, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';

interface DateRangePickerProps {
  value: { from: Date | null; to: Date | null };
  onChange: (value: { from: Date | null; to: Date | null }) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingFrom, setSelectingFrom] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const quickSelects = [
    { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
    { label: 'Last 7 Days', getValue: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 7);
      return { from, to };
    }},
    { label: 'Last 30 Days', getValue: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 30);
      return { from, to };
    }},
    { label: 'This Month', getValue: () => {
      const now = new Date();
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: new Date(now.getFullYear(), now.getMonth() + 1, 0) };
    }},
    { label: 'Last Month', getValue: () => {
      const now = new Date();
      return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 0) };
    }},
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (selectingFrom) {
      onChange({ from: selectedDate, to: value.to });
      setSelectingFrom(false);
    } else {
      if (value.from && selectedDate < value.from) {
        onChange({ from: selectedDate, to: value.from });
      } else {
        onChange({ from: value.from, to: selectedDate });
      }
      setSelectingFrom(true);
      setIsOpen(false);
    }
  };

  const isDateInRange = (day: number) => {
    if (!value.from || !value.to) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date >= value.from && date <= value.to;
  };

  const isDateSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toDateString();
    return (value.from && dateStr === value.from.toDateString()) || (value.to && dateStr === value.to.toDateString());
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 border border-[#ddd] rounded-lg cursor-pointer hover:border-[#06B6D4] focus-within:ring-2 focus-within:ring-[#06B6D4] focus-within:border-transparent transition-all"
      >
        <Calendar className="w-4 h-4 text-[#8B5CF6]" />
        <span className="flex-1 text-sm text-[#333]">
          {value.from && value.to
            ? `${formatDate(value.from)} - ${formatDate(value.to)}`
            : 'Select date range'}
        </span>
        {(value.from || value.to) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange({ from: null, to: null });
            }}
            className="text-[#999] hover:text-[#333]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-[#ddd] p-4 z-50 w-[400px]">
          <div className="mb-4">
            <div className="text-sm text-[#666] mb-2">Quick Select:</div>
            <div className="flex flex-wrap gap-2">
              {quickSelects.map((quick) => (
                <button
                  key={quick.label}
                  onClick={() => {
                    onChange(quick.getValue());
                    setIsOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs border border-[#ddd] rounded-md text-[#666] hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition-colors"
                >
                  {quick.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#eee] pt-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="px-3 py-1 text-[#666] hover:text-[#333]"
              >
                ‹
              </button>
              <div className="font-medium text-[#333]">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="px-3 py-1 text-[#666] hover:text-[#333]"
              >
                ›
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-center text-xs text-[#999] font-medium py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const inRange = isDateInRange(day);
                const selected = isDateSelected(day);
                const today = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`
                      aspect-square flex items-center justify-center rounded-lg text-sm transition-all
                      ${selected ? 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white font-medium' : ''}
                      ${inRange && !selected ? 'bg-[#f0ebff]' : ''}
                      ${!selected && !inRange ? 'hover:bg-[#f8f9fa]' : ''}
                      ${today && !selected ? 'border border-[#06B6D4]' : ''}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#eee] mt-4 pt-4 flex items-center justify-between text-sm">
            <div className="text-[#666]">
              {selectingFrom ? 'Select start date' : 'Select end date'}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onChange({ from: null, to: null });
                  setIsOpen(false);
                }}
                className="px-4 py-1.5 border border-[#ddd] rounded-md text-[#666] hover:bg-[#f8f9fa]"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white rounded-md hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
