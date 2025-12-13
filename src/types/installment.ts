export type InstallmentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type InstallmentType = 'receivable' | 'payable'; // دریافتنی / پرداختنی

export interface Installment {
  id: string;
  type: InstallmentType;
  title: string;
  principalAmount: number; // مبلغ اصل
  interestRate: number; // نرخ کارمزد (درصد)
  interestAmount: number; // مبلغ کارمزد
  totalAmount: number; // مبلغ کل (اصل + کارمزد)
  paidAmount: number;
  remainingAmount: number;
  installmentCount: number;
  paidCount: number;
  installmentAmount: number;
  durationMonths: number; // مدت بازپرداخت (ماه)
  startDate: string;
  jalaliStartDate: string;
  description?: string;
  creditor?: string; // طلبکار (برای پرداختنی)
  debtor?: string; // بدهکار (برای دریافتنی)
  createdAt: string;
  updatedAt: string;
}

export interface InstallmentPayment {
  id: string;
  installmentId: string;
  amount: number;
  dueDate: string;
  jalaliDueDate: string;
  paymentDate?: string;
  jalaliPaymentDate?: string;
  status: InstallmentStatus;
  installmentNumber: number;
  description?: string;
  createdAt: string;
}

export interface InstallmentFilter {
  type?: InstallmentType;
  status?: InstallmentStatus;
  searchQuery?: string;
}
