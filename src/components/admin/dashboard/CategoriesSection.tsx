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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAdminCategories } from "@/hooks/useAdminCategories";

export function CategoriesSection() {
  const { toast } = useToast();
  const { categories, addCategory, updateCategory, deleteCategory, toggleVisible, isLoading } = useAdminCategories();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para a categoria",
        variant: "destructive",
      });
      return;
    }

    try {
      await addCategory(newCategoryName.trim());
      toast({
        title: "✅ Sucesso!",
        description: "Categoria adicionada com sucesso!",
      });
      setNewCategoryName("");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar a categoria.",
        variant: "destructive",
      });
    }
  };

  const handleToggleVisible = async (id: string) => {
    try {
      await toggleVisible(id);
      toast({
        title: "✅ Atualizado!",
        description: "Status da categoria atualizado.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para a categoria",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      try {
        await updateCategory({ id: editingId, updates: { name: editingName.trim() } });
        toast({
          title: "✅ Sucesso!",
          description: "Categoria atualizada com sucesso!",
        });
        setEditingId(null);
        setEditingName("");
      } catch (error: any) {
        toast({
          title: "Erro",
          description: error.message || "Não foi possível atualizar a categoria.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteCategory(deleteId);
        toast({
          title: "✅ Removido!",
          description: "Categoria removida com sucesso.",
        });
        setDeleteId(null);
      } catch (error: any) {
        toast({
          title: "Erro",
          description: error.message || "Não foi possível remover a categoria.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                <TableCell className="font-medium">
                  {editingId === category.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                        className="flex-1"
                        autoFocus
                      />
                      <Button onClick={handleSaveEdit} size="sm">
                        Salvar
                      </Button>
                      <Button onClick={handleCancelEdit} variant="ghost" size="sm">
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    category.name
                  )}
                </TableCell>
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
                    {editingId !== category.id && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleStartEdit(category.id, category.name)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteClick(category.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
