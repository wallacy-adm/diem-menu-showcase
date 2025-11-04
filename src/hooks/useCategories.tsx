import { useLocalStorage } from './useLocalStorage';

export interface Category {
  id: string;
  name: string;
  visible: boolean;
  sortOrder: number;
}

export function useCategories() {
  const [categories, setCategories] = useLocalStorage<Category[]>('carpe-diem-categories', [
    { id: "1", name: "😍 Promoção em Dobro", visible: true, sortOrder: 0 },
    { id: "2", name: "⭐ Promoção do Dia", visible: true, sortOrder: 1 },
    { id: "3", name: "🏆 Campeões de Vendas", visible: true, sortOrder: 2 },
  ]);

  const addCategory = (name: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      visible: true,
      sortOrder: categories.length,
    };
    setCategories([...categories, newCategory]);
    return newCategory;
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ));
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const toggleVisible = (id: string) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, visible: !cat.visible } : cat
    ));
  };

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleVisible,
  };
}
