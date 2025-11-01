import { useState } from "react";
import { Camera, Search, Star, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/admin/CategoryCard";
import { EditProductModal } from "@/components/admin/EditProductModal";
import { AdminBottomNav } from "@/components/admin/AdminBottomNav";

export default function Admin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFeatured, setShowFeatured] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Mock data - será substituído por dados reais do backend
  const categories = [
    {
      id: "1",
      name: "😍 PROMOÇÃO DO DIA",
      emoji: "😍",
      productCount: 5,
      expanded: false,
      products: [
        {
          id: "p1",
          name: "Produto Exemplo",
          image: "/placeholder.svg",
          price: 99.99,
          oldPrice: 169.99,
          visible: true
        }
      ]
    },
    {
      id: "2",
      name: "😋 CAMPEÕES DE VENDAS",
      emoji: "😋",
      productCount: 8,
      expanded: false,
      products: []
    }
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-20">
      {/* Header Banner */}
      <div className="bg-card mb-3">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="/src/assets/carpe-diem-logo.png" 
              alt="Carpe Diem Motel" 
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                <label className="text-xs text-muted-foreground">Negócio</label>
              </div>
              <div className="relative">
                <Input 
                  value="Aproveite o Momento!"
                  className="bg-background border-input text-sm font-medium pr-12"
                  readOnly
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  20/45
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-card mb-3">
        <div className="max-w-md mx-auto p-3 space-y-3">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11 font-semibold rounded-lg">
            <Menu className="w-5 h-5" />
            Categorias
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background border-input rounded-lg"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-muted-foreground" />
              <Switch 
                checked={showFeatured}
                onCheckedChange={setShowFeatured}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="max-w-md mx-auto p-4 space-y-3">
        {categories.map((category) => (
          <CategoryCard 
            key={category.id}
            category={category}
            onEditProduct={setEditingProduct}
          />
        ))}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal 
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {/* Bottom Navigation */}
      <AdminBottomNav activeTab="cardapio" />
    </div>
  );
}
