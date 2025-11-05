import { useMemo } from "react";
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
import { useAdminProducts } from "@/hooks/useAdminProducts";

export function PromotionsSection() {
  const { toast } = useToast();
  const { products, toggleVisible, isLoading } = useAdminProducts();

  const promotionalProducts = useMemo(() => {
    return products
      .filter(product => product.old_price && product.old_price > product.price)
      .map(product => ({
        id: product.id,
        productName: product.name,
        originalPrice: product.old_price!,
        promoPrice: product.price,
        discount: Math.round(((product.old_price! - product.price) / product.old_price!) * 100),
        active: product.visible,
      }));
  }, [products]);

  const handleTogglePromotion = async (id: string) => {
    try {
      await toggleVisible(id);
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
            Produtos em promoção (com preço antigo maior que o atual)
          </p>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Preço Original</TableHead>
              <TableHead className="text-right">Preço Promocional</TableHead>
              <TableHead className="text-center">Desconto</TableHead>
              <TableHead className="w-32 text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotionalProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhuma promoção cadastrada. Adicione produtos com preço antigo maior que o preço atual.
                </TableCell>
              </TableRow>
            ) : (
              promotionalProducts.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-medium">{promo.productName}</TableCell>
                  <TableCell className="text-right text-muted-foreground line-through">
                    R$ {promo.originalPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-primary font-bold">
                    R$ {promo.promoPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive text-destructive-foreground">
                      -{promo.discount}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={promo.active}
                        onCheckedChange={() => handleTogglePromotion(promo.id)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {promo.active ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
