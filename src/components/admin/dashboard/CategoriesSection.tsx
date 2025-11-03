import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

export function CategoriesSection() {
  const { toast } = useToast();
  const [newCategoryName, setNewCategoryName] = useState("");

  // Mock data - será substituído por dados do Supabase
  const categories = [
    { id: "1", name: "😍 Promoção em Dobro", visible: true, sortOrder: 0 },
    { id: "2", name: "⭐ Promoção do Dia", visible: true, sortOrder: 1 },
    { id: "3", name: "🏆 Campeões de Vendas", visible: true, sortOrder: 2 },
  ];

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para a categoria",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implementar com Supabase
    toast({
      title: "Sucesso!",
      description: "Categoria adicionada com sucesso!",
    });
    setNewCategoryName("");
  };

  const handleToggleVisible = (id: string) => {
    // TODO: Implementar com Supabase
    toast({
      title: "Atualizado!",
      description: "Status da categoria atualizado.",
    });
  };

  const handleDelete = (id: string) => {
    // TODO: Implementar com Supabase
    toast({
      title: "Removido!",
      description: "Categoria removida com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Categorias</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as categorias do seu cardápio
          </p>
        </div>
      </div>

      {/* Add Category */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Nome da nova categoria (pode incluir emojis)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
            className="flex-1"
          />
          <Button onClick={handleAddCategory} className="gap-2">
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="w-32 text-center">Status</TableHead>
              <TableHead className="w-32 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Switch
                      checked={category.visible}
                      onCheckedChange={() => handleToggleVisible(category.id)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {category.visible ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
