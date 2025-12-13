import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  toJalali, 
  toGregorian, 
  getJalaliMonthName, 
  generateJalaliCalendar,
  getJalaliDaysInMonth 
} from '@/lib/jalali';

interface JalaliCalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  className?: string;
}

const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export const JalaliCalendar: React.FC<JalaliCalendarProps> = ({
  selected,
  onSelect,
  className,
}) => {
  const today = new Date();
  const todayJalali = toJalali(today);
  
  const [viewYear, setViewYear] = useState(
    selected ? toJalali(selected).jy : todayJalali.jy
  );
  const [viewMonth, setViewMonth] = useState(
    selected ? toJalali(selected).jm : todayJalali.jm
  );

  const selectedJalali = selected ? toJalali(selected) : null;
  const weeks = generateJalaliCalendar(viewYear, viewMonth);

  const goToPrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDayClick = (day: number) => {
    const date = toGregorian(viewYear, viewMonth, day);
    onSelect(date);
  };

  const isSelected = (day: number) => {
    if (!selectedJalali) return false;
    return (
      selectedJalali.jy === viewYear &&
      selectedJalali.jm === viewMonth &&
      selectedJalali.jd === day
    );
  };

  const isToday = (day: number) => {
    return (
      todayJalali.jy === viewYear &&
      todayJalali.jm === viewMonth &&
      todayJalali.jd === day
    );
  };

  return (
    <div className={cn('p-4 bg-card rounded-xl', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="font-semibold text-foreground">
          {getJalaliMonthName(viewMonth)} {viewYear}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => (
              <button
                key={dayIndex}
                onClick={() => day && handleDayClick(day)}
                disabled={!day}
                className={cn(
                  'h-8 w-8 rounded-lg text-sm transition-all duration-200',
                  'flex items-center justify-center',
                  !day && 'invisible',
                  day && 'hover:bg-secondary',
                  isSelected(day!) && 'bg-primary text-primary-foreground hover:bg-primary/90',
                  isToday(day!) && !isSelected(day!) && 'border border-primary text-primary',
                  !isSelected(day!) && !isToday(day!) && 'text-foreground'
                )}
              >
                {day}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
