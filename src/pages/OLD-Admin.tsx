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
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#F2F2F7' }}>
      {/* Header Banner */}
      <div className="bg-white shadow-sm mb-4">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center gap-3">
            <img 
              src="/src/assets/carpe-diem-logo.png" 
              alt="Carpe Diem Motel" 
              className="w-[50px] h-[50px] object-cover rounded-lg"
              style={{ borderRadius: '8px' }}
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4" style={{ color: '#007AFF' }} />
                <label className="text-xs" style={{ color: '#8A8A8E' }}>Negócio</label>
              </div>
              <div className="relative">
                <Input 
                  value="Aproveite o Momento!"
                  className="text-sm font-medium pr-12 bg-white"
                  style={{ 
                    borderColor: '#E5E5EA',
                    color: '#1C1C1E'
                  }}
                  readOnly
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#8A8A8E' }}>
                  20/45
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-md mx-auto px-4 mb-4 space-y-3">
        <Button 
          className="w-full gap-2 h-11 font-semibold text-white border-0"
          style={{ 
            backgroundColor: '#007AFF',
            borderRadius: '10px'
          }}
        >
          <Menu className="w-5 h-5" />
          Categorias
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
              style={{ color: '#8A8A8E' }}
            />
            <Input 
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white h-10"
              style={{ 
                borderColor: '#E5E5EA',
                borderRadius: '20px'
              }}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5" style={{ color: '#8A8A8E' }} />
            <Switch 
              checked={showFeatured}
              onCheckedChange={setShowFeatured}
            />
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
