import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { CategoryIcon } from './CategoryIcon';

interface CategorySelectorProps {
  selected: string;
  onSelect: (categoryId: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selected,
  onSelect,
}) => {
  const { categories } = useApp();

  return (
    <div className="grid grid-cols-4 gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          className={cn(
            'flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200',
            'border-2',
            selected === category.id
              ? 'border-primary bg-primary/10'
              : 'border-transparent bg-secondary/50 hover:bg-secondary'
          )}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <CategoryIcon
              icon={category.icon}
              className="w-4 h-4"
              style={{ color: category.color }}
            />
          </div>
          <span className="text-xs font-medium text-foreground truncate w-full text-center">
            {category.name}
          </span>
        </button>
      ))}
    </div>
  );
};
