import { useState } from "react";
import { X, MoreVertical, Camera, Info, Plus } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditProductModalProps {
  product: any;
  onClose: () => void;
}

export function EditProductModal({ product, onClose }: EditProductModalProps) {
  const [activeTab, setActiveTab] = useState<"simple" | "variants">("simple");

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold">Editar produto</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-secondary">
              <MoreVertical className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-secondary">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Product Image */}
          <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden">
            <img 
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center">
                <Camera className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Nome</label>
            <Input 
              defaultValue={product.name}
              className="bg-secondary border-border"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Descrição</label>
            <Textarea 
              defaultValue="Descrição do produto"
              className="bg-secondary border-border min-h-[100px]"
            />
          </div>

          {/* Price Section */}
          <div className="space-y-4">
            {/* Segmented Control */}
            <div className="flex rounded-lg overflow-hidden" style={{ backgroundColor: '#E5E5EA' }}>
              <button
                onClick={() => setActiveTab("simple")}
                className="flex-1 py-2 text-sm font-medium transition-colors"
                style={
                  activeTab === "simple" 
                    ? { backgroundColor: '#007AFF', color: 'white' }
                    : { backgroundColor: 'transparent', color: '#1C1C1E' }
                }
              >
                Simples
              </button>
              <button
                onClick={() => setActiveTab("variants")}
                className="flex-1 py-2 text-sm font-medium transition-colors"
                style={
                  activeTab === "variants" 
                    ? { backgroundColor: '#007AFF', color: 'white' }
                    : { backgroundColor: 'transparent', color: '#1C1C1E' }
                }
              >
                Variantes
              </button>
            </div>

            {/* Price Input */}
            {activeTab === "simple" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Preço</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input 
                      type="number"
                      defaultValue={product.price}
                      className="bg-secondary border-border pl-10"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    style={{ 
                      backgroundColor: '#E8F5E9',
                      color: '#2E7D32',
                      borderColor: '#E5E5EA',
                      borderRadius: '16px'
                    }}
                  >
                    Disponível
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    style={{ 
                      backgroundColor: '#E5E5EA',
                      color: '#1C1C1E',
                      borderColor: '#E5E5EA',
                      borderRadius: '16px'
                    }}
                  >
                    + Desconto
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    style={{ 
                      backgroundColor: '#E5E5EA',
                      color: '#1C1C1E',
                      borderColor: '#E5E5EA',
                      borderRadius: '16px'
                    }}
                  >
                    + Custo
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    style={{ 
                      backgroundColor: '#E5E5EA',
                      color: '#1C1C1E',
                      borderColor: '#E5E5EA',
                      borderRadius: '16px'
                    }}
                  >
                    + Embalagem
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    style={{ 
                      backgroundColor: '#E5E5EA',
                      color: '#1C1C1E',
                      borderColor: '#E5E5EA',
                      borderRadius: '16px'
                    }}
                  >
                    + SKU
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Stock Control */}
          <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Controle de estoque</span>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
            <Switch />
          </div>

          {/* Add Modifier */}
          <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
            <span className="text-sm font-medium">Adicionar modificador</span>
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Kitchen */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Cozinha</label>
            <Select defaultValue="main">
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Cozinha principal</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="desserts">Sobremesas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
