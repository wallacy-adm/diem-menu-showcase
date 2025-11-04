import { useLocalStorage } from './useLocalStorage';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  visible: boolean;
}

export function useProducts() {
  const [products, setProducts] = useLocalStorage<Product[]>('carpe-diem-products', []);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    setProducts([...products, newProduct]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(products.map(prod =>
      prod.id === id ? { ...prod, ...updates } : prod
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(prod => prod.id !== id));
  };

  const toggleVisible = (id: string) => {
    setProducts(products.map(prod =>
      prod.id === id ? { ...prod, visible: !prod.visible } : prod
    ));
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleVisible,
  };
}
