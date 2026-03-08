/**
 * Dataset convertido do projeto diem-menu-showcase para uso em menu-express.
 * Formato alvo: src/data/menuData.ts
 */

export type MenuProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice: number | null;
  image: string;
  featured: boolean;
  visible: boolean;
  sortOrder: number;
};

export type MenuCategory = {
  id: string;
  name: string;
  emoji: string;
  visible: boolean;
  sortOrder: number;
  products: MenuProduct[];
};

export type MenuPromotion = {
  id: string;
  name: string;
  category: string;
  productName: string;
  discountPercentage: number;
  originalPrice: number;
  discountedPrice: number;
  inferredFromOldPrice: boolean;
};

export const menuData: {
  categories: MenuCategory[];
  promotions: MenuPromotion[];
} = {
  categories: [
    {
      id: 'cat-promocao-em-dobro',
      name: 'Promoção em Dobro',
      emoji: '🔥',
      visible: true,
      sortOrder: 1,
      products: [
        {
          id: 'prod-dupla-de-cerveja-heineken',
          name: 'Dupla de Cerveja Heineken',
          description: 'Duas latas de Heineken geladas',
          price: 25.0,
          oldPrice: 35.0,
          image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
          featured: true,
          visible: true,
          sortOrder: 1,
        },
        {
          id: 'prod-combo-espumante-morangos',
          name: 'Combo Espumante + Morangos',
          description: 'Espumante Chandon + Morangos com chocolate',
          price: 89.0,
          oldPrice: 120.0,
          image: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400',
          featured: true,
          visible: true,
          sortOrder: 2,
        },
      ],
    },
    {
      id: 'cat-promocao-do-dia',
      name: 'Promoção do Dia',
      emoji: '😍',
      visible: true,
      sortOrder: 2,
      products: [
        {
          id: 'prod-file-mignon-especial',
          name: 'Filé Mignon Especial',
          description: 'Filé mignon grelhado com molho madeira',
          price: 65.0,
          oldPrice: 85.0,
          image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400',
          featured: true,
          visible: true,
          sortOrder: 1,
        },
        {
          id: 'prod-risoto-camarao',
          name: 'Risoto de Camarão',
          description: 'Risoto cremoso com camarões frescos',
          price: 55.0,
          oldPrice: 75.0,
          image: 'https://images.unsplash.com/photo-1476124369491-c59e312f1d44?w=400',
          featured: true,
          visible: true,
          sortOrder: 2,
        },
      ],
    },
    {
      id: 'cat-campeoes-de-vendas',
      name: 'Campeões de Vendas',
      emoji: '🏆',
      visible: true,
      sortOrder: 3,
      products: [
        {
          id: 'prod-fondue-de-chocolate',
          name: 'Fondue de Chocolate',
          description: 'Fondue de chocolate belga com frutas',
          price: 45.0,
          oldPrice: null,
          image: 'https://images.unsplash.com/photo-1588195538326-c5b1e5b80daf?w=400',
          featured: true,
          visible: true,
          sortOrder: 1,
        },
        {
          id: 'prod-picanha-ao-molho',
          name: 'Picanha ao Molho',
          description: 'Picanha grelhada com molho especial',
          price: 78.0,
          oldPrice: null,
          image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
          featured: true,
          visible: true,
          sortOrder: 2,
        },
        {
          id: 'prod-salmao-grelhado',
          name: 'Salmão Grelhado',
          description: 'Salmão grelhado com legumes',
          price: 68.0,
          oldPrice: null,
          image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
          featured: true,
          visible: true,
          sortOrder: 3,
        },
      ],
    },
    { id: 'cat-indicacao-do-chef', name: 'Indicação do Chef', emoji: '👨‍🍳', visible: true, sortOrder: 4, products: [] },
    { id: 'cat-espumantes', name: 'Espumantes', emoji: '🍾', visible: true, sortOrder: 5, products: [] },
    { id: 'cat-vinhos-nacionais', name: 'Vinhos Nacionais', emoji: '🍷', visible: true, sortOrder: 6, products: [] },
    { id: 'cat-vinhos-importados', name: 'Vinhos Importados', emoji: '🍇', visible: true, sortOrder: 7, products: [] },
    { id: 'cat-petiscos', name: 'Petiscos', emoji: '🍢', visible: true, sortOrder: 8, products: [] },
    { id: 'cat-carnes', name: 'Carnes', emoji: '🥩', visible: true, sortOrder: 9, products: [] },
    { id: 'cat-frangos', name: 'Frangos', emoji: '🍗', visible: true, sortOrder: 10, products: [] },
    { id: 'cat-peixes', name: 'Peixes', emoji: '🐟', visible: true, sortOrder: 11, products: [] },
    { id: 'cat-massas', name: 'Massas', emoji: '🍝', visible: true, sortOrder: 12, products: [] },
    { id: 'cat-porcoes-extras', name: 'Porções Extras', emoji: '🍟', visible: true, sortOrder: 13, products: [] },
    { id: 'cat-sanduiches', name: 'Sanduíches', emoji: '🥪', visible: true, sortOrder: 14, products: [] },
    { id: 'cat-sobremesas', name: 'Sobremesas', emoji: '🍰', visible: true, sortOrder: 15, products: [] },
    { id: 'cat-bebidas', name: 'Bebidas', emoji: '🥤', visible: true, sortOrder: 16, products: [] },
    { id: 'cat-licores', name: 'Licores', emoji: '🍸', visible: true, sortOrder: 17, products: [] },
    { id: 'cat-sucos', name: 'Sucos', emoji: '🧃', visible: true, sortOrder: 18, products: [] },
    { id: 'cat-whisky', name: 'Whisky', emoji: '🥃', visible: true, sortOrder: 19, products: [] },
    { id: 'cat-bomboniere', name: 'Bomboniere', emoji: '🍬', visible: true, sortOrder: 20, products: [] },
    { id: 'cat-perfumaria', name: 'Perfumaria', emoji: '🌸', visible: true, sortOrder: 21, products: [] },
  ],
  promotions: [
    {
      id: 'promo-dupla-de-cerveja-heineken',
      name: 'Promoção inferida: Dupla de Cerveja Heineken',
      category: 'Promoção em Dobro',
      productName: 'Dupla de Cerveja Heineken',
      discountPercentage: 28.57,
      originalPrice: 35.0,
      discountedPrice: 25.0,
      inferredFromOldPrice: true,
    },
    {
      id: 'promo-combo-espumante-morangos',
      name: 'Promoção inferida: Combo Espumante + Morangos',
      category: 'Promoção em Dobro',
      productName: 'Combo Espumante + Morangos',
      discountPercentage: 25.83,
      originalPrice: 120.0,
      discountedPrice: 89.0,
      inferredFromOldPrice: true,
    },
    {
      id: 'promo-file-mignon-especial',
      name: 'Promoção inferida: Filé Mignon Especial',
      category: 'Promoção do Dia',
      productName: 'Filé Mignon Especial',
      discountPercentage: 23.53,
      originalPrice: 85.0,
      discountedPrice: 65.0,
      inferredFromOldPrice: true,
    },
    {
      id: 'promo-risoto-camarao',
      name: 'Promoção inferida: Risoto de Camarão',
      category: 'Promoção do Dia',
      productName: 'Risoto de Camarão',
      discountPercentage: 26.67,
      originalPrice: 75.0,
      discountedPrice: 55.0,
      inferredFromOldPrice: true,
    },
  ],
};

export default menuData;
