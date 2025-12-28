import { useState, useMemo } from "react";
import { Plus, Search, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
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
import { useAdminProducts, Product } from "@/hooks/useAdminProducts";
import { useAdminCategories } from "@/hooks/useAdminCategories";

export function ProductsSection() {
  const { toast } = useToast();
  const { products, addProduct, updateProduct, deleteProduct, toggleVisible, isLoading } = useAdminProducts();
  const { categories } = useAdminCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(categories.map(c => c.name)));

  // Group products by category
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
                  {/* Category Header */}
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                        <span className="text-lg">{category.emoji}</span>
                        <h3 className="font-semibold text-foreground">{category.name}</h3>
                        <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {categoryProducts.length} {categoryProducts.length === 1 ? 'produto' : 'produtos'}
                        </span>
                      </div>
                      {!category.visible && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          Categoria oculta
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
                      <div className="border-t border-border">
                        {categoryProducts.map((product, index) => {
                          const discount = calculateDiscount(product.price, product.old_price);
                          return (
                            <div
                              key={product.id}
                              className={`flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors ${
                                index !== categoryProducts.length - 1 ? 'border-b border-border/50' : ''
                              }`}
                            >
                              {/* Product Image */}
                              <div className="relative w-14 h-14 flex-shrink-0">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                {discount && (
                                  <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold px-1.5 py-0.5 rounded">
                                    -{discount}%
                                  </div>
                                )}
                              </div>

                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-foreground truncate">{product.name}</h4>
                                <p className="text-sm text-muted-foreground truncate">{product.description}</p>
                              </div>

                              {/* Price */}
                              <div className="flex flex-col items-end flex-shrink-0">
                                <span className="text-primary font-bold">
                                  R$ {product.price.toFixed(2)}
                                </span>
                                {product.old_price && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    R$ {product.old_price.toFixed(2)}
                                  </span>
                                )}
                              </div>

                              {/* Status */}
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Switch
                                  checked={product.visible}
                                  onCheckedChange={() => handleToggleVisible(product.id)}
                                />
                                <span className="text-xs text-muted-foreground w-12">
                                  {product.visible ? "Ativo" : "Inativo"}
                                </span>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(product)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(product.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
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
