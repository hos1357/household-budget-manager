export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fa-IR').format(num);
};

export const formatCurrency = (amount: number): string => {
  return `${formatNumber(amount)} تومان`;
};

export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 1000000000) {
    return `${formatNumber(Math.round(amount / 1000000000))} میلیارد`;
  }
  if (amount >= 1000000) {
    return `${formatNumber(Math.round(amount / 1000000))} میلیون`;
  }
  if (amount >= 1000) {
    return `${formatNumber(Math.round(amount / 1000))} هزار`;
  }
  return formatNumber(amount);
};

export const parseNumber = (str: string): number => {
  // Convert Persian/Arabic numerals to English
  const persianNumerals = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persianNumerals[i], 'g'), String(i));
    result = result.replace(new RegExp(arabicNumerals[i], 'g'), String(i));
  }
  
  // Remove commas, spaces, and Persian separators
  result = result.replace(/[,\s،]/g, '');
  
  // Parse as float to preserve all digits, then convert to integer
  const parsed = parseFloat(result);
  return isNaN(parsed) ? 0 : Math.round(parsed);
};

// Format number with thousand separators while typing (for input fields)
export const formatInputNumber = (value: string): string => {
  // First parse to get clean number
  const num = parseNumber(value);
  if (num === 0 && value !== '0' && value !== '۰') return '';
  // Format with thousand separators
  return new Intl.NumberFormat('fa-IR').format(num);
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
