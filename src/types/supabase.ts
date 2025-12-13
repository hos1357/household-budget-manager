export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          color: string;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon: string;
          color: string;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string;
          color?: string;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          amount: number;
          category_id: string;
          date: string;
          jalali_date: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          amount: number;
          category_id: string;
          date: string;
          jalali_date: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          amount?: number;
          category_id?: string;
          date?: string;
          jalali_date?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      incomes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          amount: number;
          date: string;
          jalali_date: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          amount: number;
          date: string;
          jalali_date: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          amount?: number;
          date?: string;
          jalali_date?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          monthly_target: number;
          current_balance: number;
          month: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          monthly_target: number;
          current_balance: number;
          month: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          monthly_target?: number;
          current_balance?: number;
          month?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      checks: {
        Row: {
          id: string;
          user_id: string;
          type: 'received' | 'issued';
          check_number: string;
          amount: number;
          issuer: string;
          receiver: string;
          bank: string;
          account_number: string | null;
          due_date: string;
          jalali_due_date: string;
          issue_date: string;
          jalali_issue_date: string;
          status: 'pending' | 'cashed' | 'bounced' | 'cancelled';
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'received' | 'issued';
          check_number: string;
          amount: number;
          issuer: string;
          receiver: string;
          bank: string;
          account_number?: string | null;
          due_date: string;
          jalali_due_date: string;
          issue_date: string;
          jalali_issue_date: string;
          status: 'pending' | 'cashed' | 'bounced' | 'cancelled';
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'received' | 'issued';
          check_number?: string;
          amount?: number;
          issuer?: string;
          receiver?: string;
          bank?: string;
          account_number?: string | null;
          due_date?: string;
          jalali_due_date?: string;
          issue_date?: string;
          jalali_issue_date?: string;
          status?: 'pending' | 'cashed' | 'bounced' | 'cancelled';
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      installments: {
        Row: {
          id: string;
          user_id: string;
          type: 'receivable' | 'payable';
          title: string;
          total_amount: number;
          paid_amount: number;
          remaining_amount: number;
          installment_count: number;
          paid_count: number;
          installment_amount: number;
          start_date: string;
          jalali_start_date: string;
          description: string | null;
          creditor: string | null;
          debtor: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'receivable' | 'payable';
          title: string;
          total_amount: number;
          paid_amount?: number;
          remaining_amount: number;
          installment_count: number;
          paid_count?: number;
          installment_amount: number;
          start_date: string;
          jalali_start_date: string;
          description?: string | null;
          creditor?: string | null;
          debtor?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'receivable' | 'payable';
          title?: string;
          total_amount?: number;
          paid_amount?: number;
          remaining_amount?: number;
          installment_count?: number;
          paid_count?: number;
          installment_amount?: number;
          start_date?: string;
          jalali_start_date?: string;
          description?: string | null;
          creditor?: string | null;
          debtor?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      installment_payments: {
        Row: {
          id: string;
          user_id: string;
          installment_id: string;
          amount: number;
          due_date: string;
          jalali_due_date: string;
          payment_date: string | null;
          jalali_payment_date: string | null;
          status: 'pending' | 'paid' | 'overdue' | 'cancelled';
          installment_number: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          installment_id: string;
          amount: number;
          due_date: string;
          jalali_due_date: string;
          payment_date?: string | null;
          jalali_payment_date?: string | null;
          status: 'pending' | 'paid' | 'overdue' | 'cancelled';
          installment_number: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          installment_id?: string;
          amount?: number;
          due_date?: string;
          jalali_due_date?: string;
          payment_date?: string | null;
          jalali_payment_date?: string | null;
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
          installment_number?: number;
          description?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
