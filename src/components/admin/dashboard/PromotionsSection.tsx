import { useState } from "react";
import { Plus, Pencil, Trash2, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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

      {/* Promotions List - Mobile Friendly */}
      <div className="space-y-4">
        {promotions.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center text-muted-foreground">
            Nenhuma promoção cadastrada. Clique em "Nova Promoção" para começar.
          </div>
        ) : (
          promotions.map((promo) => (
            <div
              key={promo.id}
              className="bg-card rounded-lg border border-border p-4 space-y-3"
            >
              {/* Header: Name + Status + Actions */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{promo.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{promo.product_name}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getStatusBadge(promo.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(promo)}
                    className="gap-1"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingId(promo.id)}
                    className="gap-1 text-destructive border-destructive/50 hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </Button>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border">
                {/* Price */}
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Preço</span>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground line-through text-xs">
                      R$ {promo.product_price.toFixed(2)}
                    </span>
                    <span className="text-primary font-bold">
                      R$ {promo.discounted_price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Discount */}
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Desconto</span>
                  <div>
                    <Badge variant="destructive">-{promo.discount_percentage}%</Badge>
                  </div>
                </div>

                {/* Period */}
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Período</span>
                  <div className="text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(promo.start_date)}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(promo.end_date)}
                    </div>
                  </div>
                </div>

                {/* Enabled Toggle */}
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Habilitada</span>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={promo.active}
                      onCheckedChange={() => handleToggleActive(promo)}
                    />
                    <span className="text-xs">{promo.active ? "Sim" : "Não"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
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
