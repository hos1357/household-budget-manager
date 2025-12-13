import React from 'react';
import {
  UtensilsCrossed,
  Car,
  Receipt,
  Wrench,
  ShoppingBag,
  Heart,
  Gamepad2,
  MoreHorizontal,
  Home,
  Zap,
  Phone,
  GraduationCap,
  Shirt,
  Gift,
  Plane,
  Coffee,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Car,
  Receipt,
  Wrench,
  ShoppingBag,
  Heart,
  Gamepad2,
  MoreHorizontal,
  Home,
  Zap,
  Phone,
  GraduationCap,
  Shirt,
  Gift,
  Plane,
  Coffee,
};

interface CategoryIconProps {
  icon: string;
  className?: string;
  style?: React.CSSProperties;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  icon,
  className,
  style,
}) => {
  const IconComponent = iconMap[icon] || MoreHorizontal;
  return <IconComponent className={className} style={style} />;
};

export const availableIcons = Object.keys(iconMap);
