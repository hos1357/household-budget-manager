import React, { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useApp } from '@/contexts/AppContext';
import { CategoryIcon, availableIcons } from '@/components/expense/CategoryIcon';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/expense';

const colorOptions = [
  '#D4A574', '#1B5E4F', '#C65D3B', '#6366F1', '#EC4899',
  '#EF4444', '#8B5CF6', '#6B7280', '#F59E0B', '#10B981',
  '#3B82F6', '#14B8A6', '#F97316', '#84CC16', '#06B6D4',
];

export const Categories: React.FC = () => {
  const { categories, expenses, addCategory, updateCategory, deleteCategory, reorderCategories } = useApp();
  const { toast } = useToast();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('MoreHorizontal');
  const [color, setColor] = useState('#D4A574');

  // Calculate usage stats
  const getCategoryUsage = (categoryId: string) => {
    return expenses.filter(e => e.categoryId === categoryId).length;
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setIcon(category.icon);
      setColor(category.color);
    } else {
      setEditingCategory(null);
      setName('');
      setIcon('MoreHorizontal');
      setColor('#D4A574');
    }
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'خطا',
        description: 'لطفاً نام دسته‌بندی را وارد کنید',
        variant: 'destructive',
      });
      return;
    }
    
    if (editingCategory) {
      updateCategory(editingCategory.id, { name: name.trim(), icon, color });
      toast({
        title: 'موفق',
        description: 'دسته‌بندی با موفقیت ویرایش شد',
      });
    } else {
      addCategory({ name: name.trim(), icon, color });
      toast({
        title: 'موفق',
        description: 'دسته‌بندی جدید اضافه شد',
      });
    }
    
    setModalOpen(false);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      const usage = getCategoryUsage(categoryToDelete.id);
      if (usage > 0) {
        toast({
          title: 'خطا',
          description: `این دسته‌بندی در ${usage} هزینه استفاده شده و قابل حذف نیست`,
          variant: 'destructive',
        });
      } else {
        deleteCategory(categoryToDelete.id);
        toast({
          title: 'حذف شد',
          description: 'دسته‌بندی با موفقیت حذف شد',
        });
      }
    }
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            دسته‌بندی‌ها
          </h1>
          <p className="text-base text-muted-foreground">
            مدیریت دسته‌بندی هزینه‌ها
          </p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="h-12 px-6 shadow-card hover:shadow-card-hover transition-all"
        >
          <Plus className="w-5 h-5 ml-2" />
          دسته‌بندی جدید
        </Button>
      </div>

      {/* Categories List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const usage = getCategoryUsage(category.id);
          
          return (
            <Card
              key={category.id}
              className="shadow-card hover:shadow-card-hover transition-all duration-300 border-0"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <CategoryIcon
                      icon={category.icon}
                      className="w-7 h-7"
                      style={{ color: category.color }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-foreground truncate">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {usage} هزینه ثبت شده
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenModal(category)}
                      className="h-10 w-10 hover:bg-secondary"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(category)}
                      className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={usage > 0}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="category-name">نام دسته‌بندی</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: خوراک"
              />
            </div>
            
            <div className="space-y-2">
              <Label>آیکون</Label>
              <div className="grid grid-cols-8 gap-2">
                {availableIcons.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={cn(
                      'p-2 rounded-lg transition-all',
                      icon === iconName
                        ? 'bg-primary/20 ring-2 ring-primary'
                        : 'bg-secondary/50 hover:bg-secondary'
                    )}
                  >
                    <CategoryIcon
                      icon={iconName}
                      className="w-5 h-5 mx-auto"
                      style={{ color: icon === iconName ? color : undefined }}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>رنگ</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((colorOption) => (
                  <button
                    key={colorOption}
                    type="button"
                    onClick={() => setColor(colorOption)}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      color === colorOption && 'ring-2 ring-offset-2 ring-foreground'
                    )}
                    style={{ backgroundColor: colorOption }}
                  />
                ))}
              </div>
            </div>
            
            {/* Preview */}
            <div className="space-y-2">
              <Label>پیش‌نمایش</Label>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <CategoryIcon
                    icon={icon}
                    className="w-5 h-5"
                    style={{ color }}
                  />
                </div>
                <span className="font-medium">
                  {name || 'نام دسته‌بندی'}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">
                {editingCategory ? 'ذخیره تغییرات' : 'افزودن'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                انصراف
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف دسته‌بندی</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف این دسته‌بندی اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
