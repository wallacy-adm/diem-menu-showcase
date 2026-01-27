import { useState, useEffect, useRef } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
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
import { Product, HighlightLevel } from "@/hooks/useAdminProducts";
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
  const [highlightEnabled, setHighlightEnabled] = useState(false);
  const [highlightLevel, setHighlightLevel] = useState<HighlightLevel>("Leve");
  const [imagePositionY, setImagePositionY] = useState(50);
  const [imageZoom, setImageZoom] = useState(1.0);
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
      setHighlightEnabled((product as any).highlight_enabled ?? false);
      setHighlightLevel(product.highlight_level || "Leve");
      setImagePositionY(product.image_position_y ?? 50);
      setImageZoom(product.image_zoom ?? 1.0);
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
      setHighlightEnabled(false);
      setHighlightLevel("Leve");
      setImagePositionY(50);
      setImageZoom(1.0);
      setImagePreview(null);
    }
  }, [product, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem (JPG, PNG, WebP)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 8MB",
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
    const oldPriceNum = oldPriceValue && oldPriceValue > 0 ? oldPriceValue : null;

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
      highlight_enabled: highlightEnabled,
      highlight_level: highlightLevel,
      image_position_y: imagePositionY,
      image_zoom: imageZoom,
    } as any);

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-visible">
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
          <div className="space-y-4">
            <Label className="text-foreground">Imagem do Produto *</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {imagePreview ? (
              <div className="space-y-4">
                {/* Preview do Card - Réplica EXATA do cardápio */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Prévia do cardápio (tamanho real)</Label>
                  
                  {/* Container que simula exatamente o card do ProductCard */}
                  <div 
                    className="bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/[0.06]"
                    style={{
                      boxShadow: '0 2px 12px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)',
                    }}
                  >
                    <div className="flex gap-3 p-4 min-h-[140px]">
                      {/* Content Left - Simulação do conteúdo */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="space-y-1.5">
                          <div className="h-4 w-3/4 bg-white/20 rounded"></div>
                          <div className="h-3 w-full bg-white/10 rounded"></div>
                          <div className="h-3 w-2/3 bg-white/10 rounded"></div>
                        </div>
                        <div className="mt-3">
                          <div className="h-5 w-1/3 bg-primary/50 rounded"></div>
                        </div>
                      </div>

                      {/* Image Right - EXATAMENTE como no cardápio */}
                      <div className="w-[100px] h-[100px] flex-shrink-0 self-center">
                        <div className="relative w-full h-full rounded-xl overflow-hidden bg-secondary/50">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            style={{
                              objectPosition: `center ${imagePositionY}%`,
                              transform: `scale(${imageZoom})`,
                              transformOrigin: `center ${imagePositionY}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controles de imagem */}
                <div className="grid gap-4">
                  {/* Zoom */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-foreground">Zoom da imagem</Label>
                      <span className="text-sm text-muted-foreground font-mono">
                        {(imageZoom * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Slider
                      value={[imageZoom]}
                      onValueChange={(value) => setImageZoom(value[0])}
                      min={1.0}
                      max={2.5}
                      step={0.05}
                      className="flex-1"
                    />
                    <p className="text-xs text-muted-foreground">
                      Aproxime ou afaste a imagem (100% a 250%)
                    </p>
                  </div>

                  {/* Posição Vertical */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-foreground">Posição vertical</Label>
                      <span className="text-sm text-muted-foreground font-mono">
                        {imagePositionY}%
                      </span>
                    </div>
                    <Slider
                      value={[imagePositionY]}
                      onValueChange={(value) => setImagePositionY(value[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <p className="text-xs text-muted-foreground">
                      0% = topo, 50% = centro, 100% = base
                    </p>
                  </div>
                </div>

                {/* Alterar imagem */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Alterar imagem
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
                    JPG, PNG ou WebP • Máximo 8MB
                  </span>
                </div>
              </Button>
            )}
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
              <SelectContent 
                className="z-[200] bg-popover" 
                position="popper"
                sideOffset={4}
              >
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

          {/* Destaque do Produto */}
          <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
            <div>
              <Label className="text-foreground">Destaque Ativo</Label>
              <p className="text-sm text-muted-foreground">
                {highlightEnabled ? "Destaque ativo no cardápio" : "Sem destaque no cardápio"}
              </p>
            </div>
            <Switch
              checked={highlightEnabled}
              onCheckedChange={setHighlightEnabled}
            />
          </div>

          {/* Nível de Destaque - só aparece quando destaque está ativo */}
          {highlightEnabled && (
            <div className="space-y-2">
              <Label className="text-foreground">Nível de Destaque</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Define a intensidade da animação de destaque no cardápio
              </p>
              <Select value={highlightLevel} onValueChange={(value: HighlightLevel) => setHighlightLevel(value)}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent 
                  className="z-[200] bg-popover" 
                  position="popper"
                  sideOffset={4}
                >
                  <SelectItem value="Leve">Leve</SelectItem>
                  <SelectItem value="Destaque">Destaque</SelectItem>
                  <SelectItem value="Super Destaque">Super Destaque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
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
