export type CheckStatus = 'pending' | 'cashed' | 'bounced' | 'cancelled';
export type CheckType = 'received' | 'issued';

export interface Check {
  id: string;
  type: CheckType;
  checkNumber: string;
  amount: number;
  issuer: string; // صادرکننده
  receiver: string; // دریافت‌کننده
  bank: string;
  accountNumber?: string;
  dueDate: string; // تاریخ سررسید
  jalaliDueDate: string;
  issueDate: string; // تاریخ صدور
  jalaliIssueDate: string;
  status: CheckStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckFilter {
  type?: CheckType;
  status?: CheckStatus;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}
