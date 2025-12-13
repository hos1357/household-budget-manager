import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  Tags, 
  Settings,
  Wallet,
  FileText,
  Calendar,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'داشبورد' },
  { to: '/expenses', icon: Receipt, label: 'هزینه‌ها' },
  { to: '/budget', icon: Wallet, label: 'تنخواه' },
  { to: '/checks', icon: FileText, label: 'چک‌ها' },
  { to: '/installments', icon: Calendar, label: 'اقساط' },
  { to: '/reports', icon: BarChart3, label: 'گزارش‌ها' },
  { to: '/categories', icon: Tags, label: 'دسته‌بندی‌ها' },
  { to: '/settings', icon: Settings, label: 'تنظیمات' },
  { to: '/admin', icon: Shield, label: 'پنل ادمین', adminOnly: true },
];

export const Sidebar: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;
      
      // Check if user is admin from database
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', user.email)
        .single();
      
      if (adminData) {
        setIsAdmin(true);
      }
    };
    checkAdmin();
  }, []);

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-card border-l border-border h-screen sticky top-0 shadow-sm">
      {/* Logo */}
      <div className="p-8 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-saffron via-primary to-emerald flex items-center justify-center shadow-card">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-foreground">همیار مالی من</h1>
            <p className="text-xs text-muted-foreground mt-0.5">مدیریت هزینه‌های خانه</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300',
                'hover:bg-secondary/80 hover:translate-x-[-4px]',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-base">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-border">
        <div className="bg-gradient-to-br from-emerald/10 to-emerald/5 rounded-2xl p-5 border border-emerald/20">
          <p className="text-sm font-semibold text-emerald">نسخه ۱.۰.۰</p>
          <p className="text-xs text-muted-foreground mt-2">ساخته شده با ❤️</p>
        </div>
      </div>
    </aside>
  );
};
