import { useState, useMemo } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [products, searchQuery]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Produtos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os produtos do seu cardápio
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

      {/* Products Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="w-32 text-center">Status</TableHead>
              <TableHead className="w-32 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {searchQuery ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const discount = calculateDiscount(product.price, product.old_price);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative w-16 h-16">
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
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <div className="flex flex-col items-end">
                        <span className="text-primary font-bold">
                          R$ {product.price.toFixed(2)}
                        </span>
                        {product.old_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            R$ {product.old_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={product.visible}
                          onCheckedChange={() => handleToggleVisible(product.id)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {product.visible ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
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
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
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
