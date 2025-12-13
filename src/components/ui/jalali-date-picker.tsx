import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { JalaliCalendar } from './jalali-calendar';
import { formatJalaliDateFull } from '@/lib/jalali';
import { cn } from '@/lib/utils';

interface JalaliDatePickerProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  placeholder?: string;
  className?: string;
}

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
  selected,
  onSelect,
  placeholder = 'انتخاب تاریخ',
  className,
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (date: Date) => {
    onSelect(date);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-right font-normal',
            !selected && 'text-muted-foreground',
            className
          )}
        >
          <Calendar className="ml-2 h-4 w-4" />
          {selected ? formatJalaliDateFull(selected) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <JalaliCalendar selected={selected} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
};
