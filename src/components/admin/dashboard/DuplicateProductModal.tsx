import { useState } from "react";
import { Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Category {
  id: string;
  name: string;
  emoji: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  old_price?: number;
  image: string;
  visible: boolean;
}

interface DuplicateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDuplicate: (targetCategory: string) => Promise<void>;
  product: Product | null;
  categories: Category[];
  isLoading?: boolean;
}

export function DuplicateProductModal({
  isOpen,
  onClose,
  onDuplicate,
  product,
  categories,
  isLoading = false,
}: DuplicateProductModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleDuplicate = async () => {
    if (!selectedCategory) return;
    await onDuplicate(selectedCategory);
    setSelectedCategory("");
    onClose();
  };

  const handleClose = () => {
    setSelectedCategory("");
    onClose();
  };

  // Filter out current category from options
  const availableCategories = categories.filter(
    (cat) => cat.name !== product?.category
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Duplicar Produto
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Product info */}
          {product && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 object-cover rounded-md"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {product.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Categoria atual: {product.category}
                </p>
              </div>
            </div>
          )}

          {/* Category selector */}
          <div className="space-y-2">
            <Label htmlFor="target-category">Copiar para categoria:</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger id="target-category">
                <SelectValue placeholder="Selecione a categoria de destino" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.emoji} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-muted-foreground">
            Uma cópia do produto será criada na categoria selecionada. O produto
            original permanecerá inalterado.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleDuplicate}
            disabled={!selectedCategory || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Duplicando...
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Duplicar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
