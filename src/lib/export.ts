import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Expense, Category } from '@/types/expense';
import { formatNumber } from './format';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: unknown) => jsPDF;
  }
}

export const exportToExcel = (
  expenses: Expense[],
  categories: Category[],
  filename: string = 'گزارش-هزینه‌ها'
): void => {
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  
  const data = expenses.map(expense => ({
    'عنوان': expense.title,
    'مبلغ (تومان)': expense.amount,
    'دسته‌بندی': categoryMap.get(expense.categoryId) || 'نامشخص',
    'تاریخ': expense.jalaliDate,
    'توضیحات': expense.description || '-',
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'هزینه‌ها');
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 30 },
  ];
  
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPDF = (
  expenses: Expense[],
  categories: Category[],
  filename: string = 'گزارش-هزینه‌ها'
): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Add Persian font support note
  doc.setFont('helvetica');
  doc.setFontSize(16);
  doc.text('Expense Report', 105, 20, { align: 'center' });
  
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  
  const tableData = expenses.map(expense => [
    expense.jalaliDate,
    categoryMap.get(expense.categoryId) || '-',
    formatNumber(expense.amount),
    expense.title,
  ]);
  
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  doc.autoTable({
    head: [['Date', 'Category', 'Amount', 'Title']],
    body: tableData,
    foot: [['', 'Total:', formatNumber(totalAmount), '']],
    startY: 30,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [212, 165, 116],
      textColor: [255, 255, 255],
    },
    footStyles: {
      fillColor: [27, 94, 79],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [250, 248, 245],
    },
  });
  
  doc.save(`${filename}.pdf`);
};
