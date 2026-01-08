import { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import type { PromotionWithProduct } from "@/hooks/useAdminPromotions";
import { format, addDays } from "date-fns";

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  promotion?: PromotionWithProduct | null;
}

export function PromotionModal({ isOpen, onClose, onSave, promotion }: PromotionModalProps) {
  const { products } = useAdminProducts();
  
  const getDefaultDates = () => {
    const now = new Date();
    const startDate = format(now, "yyyy-MM-dd'T'HH:mm");
    const endDate = format(addDays(now, 7), "yyyy-MM-dd'T'HH:mm");
    return { startDate, endDate };
  };

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discount_percentage: "0",
    product_id: "",
    active: true,
    start_date: getDefaultDates().startDate,
    end_date: getDefaultDates().endDate,
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
        start_date: format(new Date(promotion.start_date), "yyyy-MM-dd'T'HH:mm"),
        end_date: format(new Date(promotion.end_date), "yyyy-MM-dd'T'HH:mm"),
      });
      const product = products.find(p => p.id === promotion.product_id);
      setSelectedProduct(product);
    } else {
      const { startDate, endDate } = getDefaultDates();
      setFormData({
        name: "",
        description: "",
        discount_percentage: "0",
        product_id: "",
        active: true,
        start_date: startDate,
        end_date: endDate,
      });
      setSelectedProduct(null);
    }
  }, [promotion, products, isOpen]);

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
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
    };

    if (promotion) {
      await onSave({ id: promotion.id, ...data });
    } else {
      await onSave(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto overflow-x-visible">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {promotion ? "Editar Promoção" : "Nova Promoção"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              rows={2}
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
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent className="z-[200] bg-popover" position="popper" sideOffset={4}>
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

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Data Início *
              </Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Data Fim *
              </Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
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
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <Label htmlFor="active">Promoção Habilitada</Label>
            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <span className="text-sm text-muted-foreground">
                {formData.active ? "Sim" : "Não"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
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
      </DialogContent>
    </Dialog>
  );
}
