import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import type { PromotionWithProduct } from "@/hooks/useAdminPromotions";

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  promotion?: PromotionWithProduct | null;
}

export function PromotionModal({ isOpen, onClose, onSave, promotion }: PromotionModalProps) {
  const { products } = useAdminProducts();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discount_percentage: "0",
    product_id: "",
    active: true,
  });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    if (promotion) {
      setFormData({
        name: promotion.name,
        description: promotion.description || "",
        discount_percentage: promotion.discount_percentage.toString(),
        product_id: promotion.product_id,
        active: promotion.active,
      });
      const product = products.find(p => p.id === promotion.product_id);
      setSelectedProduct(product);
    } else {
      setFormData({
        name: "",
        description: "",
        discount_percentage: "0",
        product_id: "",
        active: true,
      });
      setSelectedProduct(null);
    }
  }, [promotion, products]);

  const handleProductChange = (productId: string) => {
    setFormData({ ...formData, product_id: productId });
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
  };

  const calculateDiscountedPrice = () => {
    if (!selectedProduct || !formData.discount_percentage) return 0;
    const discount = parseFloat(formData.discount_percentage) / 100;
    return selectedProduct.price * (1 - discount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      discount_percentage: parseFloat(formData.discount_percentage),
    };

    if (promotion) {
      await onSave({ id: promotion.id, ...data });
    } else {
      await onSave(data);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            {promotion ? "Editar Promoção" : "Nova Promoção"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Promoção *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Black Friday"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição da promoção..."
              rows={3}
            />
          </div>

          {/* Product Selection */}
          <div className="space-y-2">
            <Label htmlFor="product">Produto *</Label>
            <Select
              value={formData.product_id}
              onValueChange={handleProductChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - R$ {product.price.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Discount Percentage */}
          <div className="space-y-2">
            <Label htmlFor="discount">Desconto (%) *</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.discount_percentage}
              onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
              placeholder="Ex: 15"
              required
            />
          </div>

          {/* Price Preview */}
          {selectedProduct && formData.discount_percentage && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Preço Original:</span>
                <span className="font-medium">R$ {selectedProduct.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Desconto:</span>
                <span className="text-destructive font-medium">-{formData.discount_percentage}%</span>
              </div>
              <div className="flex justify-between text-base border-t border-border pt-2">
                <span className="font-semibold">Preço Promocional:</span>
                <span className="text-primary font-bold">R$ {calculateDiscountedPrice().toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <Label htmlFor="active">Status da Promoção</Label>
            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <span className="text-sm text-muted-foreground">
                {formData.active ? "Ativa" : "Inativa"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {promotion ? "Atualizar" : "Criar"} Promoção
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
