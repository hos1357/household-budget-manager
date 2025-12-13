import jalaali from 'jalaali-js';

export const toJalali = (date: Date): { jy: number; jm: number; jd: number } => {
  return jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
};

export const toGregorian = (jy: number, jm: number, jd: number): Date => {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  return new Date(gy, gm - 1, gd);
};

export const formatJalaliDate = (date: Date): string => {
  const { jy, jm, jd } = toJalali(date);
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
};

export const formatJalaliDateFull = (date: Date): string => {
  const { jy, jm, jd } = toJalali(date);
  const monthNames = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  return `${jd} ${monthNames[jm - 1]} ${jy}`;
};

export const getJalaliMonth = (date: Date): string => {
  const { jy, jm } = toJalali(date);
  return `${jy}/${String(jm).padStart(2, '0')}`;
};

export const getJalaliMonthName = (month: number): string => {
  const monthNames = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  return monthNames[month - 1] || '';
};

export const getJalaliWeekDay = (date: Date): string => {
  const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
  return dayNames[date.getDay()];
};

export const parseJalaliDate = (jalaliStr: string): Date => {
  const parts = jalaliStr.split('/').map(Number);
  if (parts.length !== 3) return new Date();
  return toGregorian(parts[0], parts[1], parts[2]);
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isThisWeek = (date: Date): boolean => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return date >= weekStart && date < weekEnd;
};

export const isThisMonth = (date: Date): boolean => {
  const today = new Date();
  const { jy: todayJy, jm: todayJm } = toJalali(today);
  const { jy, jm } = toJalali(date);
  return jy === todayJy && jm === todayJm;
};

export const getJalaliDaysInMonth = (jy: number, jm: number): number => {
  return jalaali.jalaaliMonthLength(jy, jm);
};

export const generateJalaliCalendar = (jy: number, jm: number): (number | null)[][] => {
  const daysInMonth = getJalaliDaysInMonth(jy, jm);
  const firstDay = toGregorian(jy, jm, 1);
  const startDayOfWeek = (firstDay.getDay() + 1) % 7; // Saturday = 0
  
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];
  
  // Add empty cells for days before the first day
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Add empty cells for remaining days
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }
  
  return weeks;
};
