import { useState, useMemo } from "react";
import { Plus, Search, Pencil, Trash2, ChevronDown, ChevronRight, ArrowUp, ArrowDown, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { ProductModal } from "./ProductModal";
import { DuplicateProductModal } from "./DuplicateProductModal";
import { useAdminProducts, Product } from "@/hooks/useAdminProducts";
import { useAdminCategories } from "@/hooks/useAdminCategories";

export function ProductsSection() {
  const { toast } = useToast();
  const { products, addProduct, updateProduct, deleteProduct, toggleVisible, reorderProducts, isLoading } = useAdminProducts();
  const { categories } = useAdminCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(categories.map(c => c.name)));
  const [duplicatingProduct, setDuplicatingProduct] = useState<Product | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Group products by category and sort by sort_order
  const groupedProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    const grouped: Record<string, Product[]> = {};
    categories.forEach(cat => {
      grouped[cat.name] = [];
    });
    
    filtered.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });

    // Sort products within each category by sort_order
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => a.sort_order - b.sort_order);
    });

    return grouped;
  }, [products, categories, searchQuery]);

  // Expand all categories when data loads
  useMemo(() => {
    if (categories.length > 0 && expandedCategories.size === 0) {
      setExpandedCategories(new Set(categories.map(c => c.name)));
    }
  }, [categories]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id' | 'sort_order'>) => {
    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, updates: productData });
        toast({
          title: "✅ Sucesso!",
          description: "Produto atualizado com sucesso!",
        });
      } else {
        await addProduct(productData);
        toast({
          title: "✅ Sucesso!",
          description: "Produto adicionado com sucesso!",
        });
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o produto.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteProduct(deleteId);
        toast({
          title: "✅ Removido!",
          description: "Produto removido com sucesso.",
        });
        setDeleteId(null);
      } catch (error: any) {
        toast({
          title: "Erro",
          description: error.message || "Não foi possível remover o produto.",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleVisible = async (id: string) => {
    try {
      await toggleVisible(id);
      toast({
        title: "✅ Atualizado!",
        description: "Status do produto atualizado.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const calculateDiscount = (price: number, oldPrice?: number) => {
    if (!oldPrice || oldPrice <= price) return null;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  };

  const handleMoveUp = async (product: Product, categoryProducts: Product[], index: number) => {
    if (index === 0) return; // Already at top
    const previousProduct = categoryProducts[index - 1];
    try {
      await reorderProducts({
        productId1: product.id,
        sortOrder1: product.sort_order,
        productId2: previousProduct.id,
        sortOrder2: previousProduct.sort_order,
      });
      toast({
        title: "✅ Reordenado!",
        description: "Produto movido para cima.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível reordenar.",
        variant: "destructive",
      });
    }
  };

  const handleMoveDown = async (product: Product, categoryProducts: Product[], index: number) => {
    if (index === categoryProducts.length - 1) return; // Already at bottom
    const nextProduct = categoryProducts[index + 1];
    try {
      await reorderProducts({
        productId1: product.id,
        sortOrder1: product.sort_order,
        productId2: nextProduct.id,
        sortOrder2: nextProduct.sort_order,
      });
      toast({
        title: "✅ Reordenado!",
        description: "Produto movido para baixo.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível reordenar.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateClick = (product: Product) => {
    setDuplicatingProduct(product);
  };

  const handleDuplicateProduct = async (targetCategory: string) => {
    if (!duplicatingProduct) return;
    
    setIsDuplicating(true);
    try {
      await addProduct({
        name: duplicatingProduct.name,
        description: duplicatingProduct.description,
        category: targetCategory,
        price: duplicatingProduct.price,
        old_price: duplicatingProduct.old_price,
        image: duplicatingProduct.image,
        visible: duplicatingProduct.visible,
        featured: duplicatingProduct.featured,
        highlight_level: duplicatingProduct.highlight_level,
        image_position_y: duplicatingProduct.image_position_y ?? 50,
        image_zoom: duplicatingProduct.image_zoom ?? 1.0,
      });
      
      toast({
        title: "✅ Duplicado!",
        description: `Produto copiado para "${targetCategory}" com sucesso.`,
      });
      setDuplicatingProduct(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível duplicar o produto.",
        variant: "destructive",
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalProducts = products.length;
  const visibleCategories = categories.filter(cat => groupedProducts[cat.name]?.length > 0 || !searchQuery);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Produtos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalProducts} produtos em {categories.length} categorias
          </p>
        </div>
        <Button onClick={handleAddProduct} className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Produto
        </Button>
      </div>

      {/* Search */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Products grouped by category */}
      <div className="space-y-4">
        {visibleCategories.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center text-muted-foreground">
            {searchQuery ? "Nenhum produto encontrado" : "Nenhuma categoria cadastrada"}
          </div>
        ) : (
          visibleCategories.map((category) => {
            const categoryProducts = groupedProducts[category.name] || [];
            const isExpanded = expandedCategories.has(category.name);
            
            // Hide empty categories during search
            if (searchQuery && categoryProducts.length === 0) {
              return null;
            }

            return (
              <Collapsible
                key={category.id}
                open={isExpanded}
                onOpenChange={() => toggleCategory(category.name)}
              >
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                  {/* Category Header - Visual distinction */}
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/60 transition-colors bg-muted/40 border-b border-border">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-primary" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                        <span className="text-xl">{category.emoji}</span>
                        <h3 className="font-bold text-foreground text-base">{category.name}</h3>
                        <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border">
                          {categoryProducts.length} {categoryProducts.length === 1 ? 'produto' : 'produtos'}
                        </span>
                      </div>
                      {!category.visible && (
                        <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded font-medium">
                          Oculta
                        </span>
                      )}
                    </div>
                  </CollapsibleTrigger>

                  {/* Products List */}
                  <CollapsibleContent>
                    {categoryProducts.length === 0 ? (
                      <div className="px-4 pb-4 pt-2 text-sm text-muted-foreground border-t border-border">
                        Nenhum produto nesta categoria
                      </div>
                    ) : (
                      <div className="border-t border-border divide-y divide-border/50">
                        {categoryProducts.map((product, index) => {
                          const discount = calculateDiscount(product.price, product.old_price);
                          return (
                            <div
                              key={product.id}
                              className="p-3 hover:bg-muted/30 transition-colors"
                            >
                              {/* Mobile-first: stack vertically */}
                              <div className="flex items-start gap-3">
                                {/* Product Image */}
                                <div className="relative w-12 h-12 flex-shrink-0">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                  {discount && (
                                    <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold px-1 py-0.5 rounded">
                                      -{discount}%
                                    </div>
                                  )}
                                </div>

                                {/* Product Info & Price */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-foreground text-sm truncate">{product.name}</h4>
                                  <p className="text-xs text-muted-foreground truncate">{product.description}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-primary font-bold text-sm">
                                      R$ {product.price.toFixed(2)}
                                    </span>
                                    {product.old_price && (
                                      <span className="text-[10px] text-muted-foreground line-through">
                                        R$ {product.old_price.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Status Switch */}
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <Switch
                                    checked={product.visible}
                                    onCheckedChange={() => handleToggleVisible(product.id)}
                                  />
                                  <span className="text-[10px] text-muted-foreground w-10">
                                    {product.visible ? "Ativo" : "Inativo"}
                                  </span>
                                </div>
                              </div>

                              {/* Actions Row */}
                              <div className="flex items-center justify-end gap-1 mt-2">
                                {/* Reorder Buttons */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleMoveUp(product, categoryProducts, index)}
                                  disabled={index === 0}
                                  title="Mover para cima"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleMoveDown(product, categoryProducts, index)}
                                  disabled={index === categoryProducts.length - 1}
                                  title="Mover para baixo"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </Button>

                                <div className="w-px h-4 bg-border mx-1" />

                                {/* Action Buttons */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleDuplicateClick(product)}
                                  title="Duplicar para outra categoria"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleEdit(product)}
                                  title="Editar produto"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteClick(product.id)}
                                  title="Excluir produto"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })
        )}
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct || undefined}
        categories={categories}
      />

      <DuplicateProductModal
        isOpen={!!duplicatingProduct}
        onClose={() => setDuplicatingProduct(null)}
        onDuplicate={handleDuplicateProduct}
        product={duplicatingProduct}
        categories={categories}
        isLoading={isDuplicating}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
