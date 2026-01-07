import { useState, useEffect, useRef } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/hooks/useAdminProducts";
import { Category } from "@/hooks/useAdminCategories";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'sort_order'>) => void;
  product?: Product;
  categories: Category[];
}

export function ProductModal({ isOpen, onClose, onSave, product, categories }: ProductModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [visible, setVisible] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setDescription(product.description || "");
      setCategory(product.category || "");
      setPrice(product.price?.toString() || "");
      setOldPrice(product.old_price?.toString() || "");
      setImageUrl(product.image || "");
      setVisible(product.visible ?? true);
      setFeatured(product.featured ?? false);
      setImagePreview(product.image || null);
    } else {
      setName("");
      setDescription("");
      setCategory("");
      setPrice("");
      setOldPrice("");
      setImageUrl("");
      setVisible(true);
      setFeatured(false);
      setImagePreview(null);
    }
  }, [product, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 2MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImageUrl(base64String);
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim() || !category || !price || !imageUrl) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios (nome, categoria, preço e imagem)",
        variant: "destructive",
      });
      return;
    }

    const priceNum = parseFloat(price);
    const oldPriceValue = oldPrice ? parseFloat(oldPrice) : null;
    const oldPriceNum = oldPriceValue && oldPriceValue > 0 ? oldPriceValue : undefined;

    if (isNaN(priceNum) || priceNum <= 0) {
      toast({
        title: "Erro",
        description: "Preço inválido",
        variant: "destructive",
      });
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      category,
      price: priceNum,
      old_price: oldPriceNum,
      image: imageUrl,
      visible,
      featured,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {product ? "Editar Produto" : "Adicionar Novo Produto"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Preencha as informações do produto abaixo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Upload de Imagem */}
          <div className="space-y-2">
            <Label className="text-foreground">Imagem do Produto *</Label>
            <div className="flex flex-col gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden border-2 border-border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Alterar
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-border hover:border-primary"
                >
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Clique para selecionar uma imagem
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Máximo 2MB
                    </span>
                  </div>
                </Button>
              )}
            </div>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Nome do Produto *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Picanha ao Molho Madeira"
              className="bg-background border-border"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o produto..."
              rows={3}
              className="bg-background border-border resize-none"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-foreground">
              Categoria *
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="z-[200] bg-popover">
                {categories.filter(cat => cat.visible).map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.emoji} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preços */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-foreground">
                Preço Atual *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oldPrice" className="text-foreground">
                Preço Antigo (opcional)
              </Label>
              <Input
                id="oldPrice"
                type="number"
                step="0.01"
                min="0"
                value={oldPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || parseFloat(value) >= 0) {
                    setOldPrice(value);
                  }
                }}
                placeholder="0.00"
                className="bg-background border-border"
              />
            </div>
          </div>

          {/* Visibilidade */}
          <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
            <div>
              <Label className="text-foreground">Status no Cardápio</Label>
              <p className="text-sm text-muted-foreground">
                Produto {visible ? "ativo" : "inativo"} no cardápio público
              </p>
            </div>
            <Switch
              checked={visible}
              onCheckedChange={setVisible}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground">
            Salvar Produto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
