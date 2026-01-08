import { useState } from "react";
import { Plus, Pencil, Trash2, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { useAdminPromotions, type PromotionWithProduct } from "@/hooks/useAdminPromotions";
import { PromotionModal } from "./PromotionModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function PromotionsSection() {
  const { toast } = useToast();
  const { promotions, isLoading, createPromotion, updatePromotion, deletePromotion } = useAdminPromotions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionWithProduct | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingPromotion(null);
    setIsModalOpen(true);
  };

  const handleEdit = (promotion: PromotionWithProduct) => {
    setEditingPromotion(promotion);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (editingPromotion) {
        await updatePromotion(data);
        toast({
          title: "✅ Atualizado!",
          description: "Promoção atualizada com sucesso.",
        });
      } else {
        await createPromotion(data);
        toast({
          title: "✅ Criado!",
          description: "Promoção criada com sucesso.",
        });
      }
      setIsModalOpen(false);
      setEditingPromotion(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar a promoção.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (promotion: PromotionWithProduct) => {
    try {
      await updatePromotion({ id: promotion.id, active: !promotion.active });
      toast({
        title: "✅ Atualizado!",
        description: "Status da promoção atualizado.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await deletePromotion(deletingId);
      toast({
        title: "✅ Excluído!",
        description: "Promoção excluída com sucesso.",
      });
      setDeletingId(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir a promoção.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: 'active' | 'scheduled' | 'ended') => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-600 text-white gap-1">
            <CheckCircle className="w-3 h-3" />
            Ativa
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge className="bg-blue-600 text-white gap-1">
            <Clock className="w-3 h-3" />
            Agendada
          </Badge>
        );
      case 'ended':
        return (
          <Badge variant="secondary" className="gap-1">
            <XCircle className="w-3 h-3" />
            Encerrada
          </Badge>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: ptBR });
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
          <h2 className="text-2xl font-bold text-foreground">Promoções</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as promoções com período automático
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Promoção
        </Button>
      </div>

      {/* Promotions Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-center">Desconto</TableHead>
                <TableHead className="text-center">Período</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Habilitada</TableHead>
                <TableHead className="w-24 text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhuma promoção cadastrada. Clique em "Nova Promoção" para começar.
                  </TableCell>
                </TableRow>
              ) : (
                promotions.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-medium">{promo.name}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{promo.product_name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-muted-foreground line-through text-xs">
                          R$ {promo.product_price.toFixed(2)}
                        </span>
                        <span className="text-primary font-bold">
                          R$ {promo.discounted_price.toFixed(2)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="destructive">
                        -{promo.discount_percentage}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(promo.start_date)}
                        </span>
                        <span>até</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(promo.end_date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(promo.status)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={promo.active}
                        onCheckedChange={() => handleToggleActive(promo)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(promo)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingId(promo.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modals */}
      <PromotionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPromotion(null);
        }}
        onSave={handleSave}
        promotion={editingPromotion}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta promoção? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
