import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  Wallet,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

// Main navigation items (shown in bottom bar)
const mainNavItems: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'داشبورد' },
  { to: '/expenses', icon: Receipt, label: 'هزینه‌ها' },
  { to: '/budget', icon: Wallet, label: 'تنخواه' },
  { to: '/reports', icon: BarChart3, label: 'گزارش‌ها' },
  { to: '/settings', icon: Settings, label: 'تنظیمات' },
];

export const MobileNav: React.FC = () => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around py-2 px-4">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
