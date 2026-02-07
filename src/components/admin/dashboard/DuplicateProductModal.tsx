import { useState } from "react";
import { Copy, Check, ChevronsUpDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const handleDuplicate = async () => {
    if (!selectedCategory) return;
    await onDuplicate(selectedCategory);
    setSelectedCategory("");
    onClose();
  };

  const handleClose = () => {
    setSelectedCategory("");
    setComboboxOpen(false);
    onClose();
  };

  // Filter out current category from options
  const availableCategories = categories.filter(
    (cat) => cat.name !== product?.category
  );

  const selectedCategoryData = categories.find(cat => cat.name === selectedCategory);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} modal>
      <DialogContent className="sm:max-w-[425px] overflow-visible">
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

          {/* Category selector with search */}
          <div className="space-y-2">
            <Label>Copiar para categoria:</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen} modal>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between"
                >
                  {selectedCategoryData ? (
                    <span>{selectedCategoryData.emoji} {selectedCategoryData.name}</span>
                  ) : (
                    <span className="text-muted-foreground">Selecione a categoria de destino</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-[--radix-popover-trigger-width] p-0 z-[200] pointer-events-auto" 
                align="start"
                sideOffset={4}
              >
                <Command>
                  <CommandInput placeholder="Buscar categoria..." className="pointer-events-auto" />
                  <CommandList className="max-h-[200px] overflow-auto pointer-events-auto">
                    <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                    <CommandGroup>
                      {availableCategories.map((category) => (
                        <CommandItem
                          key={category.id}
                          value={category.name}
                          onSelect={() => {
                            setSelectedCategory(category.name);
                            setComboboxOpen(false);
                          }}
                          className="pointer-events-auto cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCategory === category.name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {category.emoji} {category.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
