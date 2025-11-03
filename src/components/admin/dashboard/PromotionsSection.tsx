import { useState } from "react";
import { Percent } from "lucide-react";
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

export function PromotionsSection() {
  const { toast } = useToast();

  // Mock data
  const promotions = [
    {
      id: "1",
      productName: "Picanha Premium",
      originalPrice: 119.90,
      currentPrice: 89.90,
      discount: 25,
      active: true,
    },
    {
      id: "2",
      productName: "Salmão Grelhado",
      originalPrice: 99.90,
      currentPrice: 79.90,
      discount: 20,
      active: true,
    },
  ];

  const handleTogglePromotion = (id: string) => {
    toast({
      title: "Atualizado!",
      description: "Promoção atualizada com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Promoções</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os produtos com preços promocionais
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
            {promotions.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell className="font-medium">{promo.productName}</TableCell>
                <TableCell className="text-right text-muted-foreground line-through">
                  R$ {promo.originalPrice.toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-primary font-semibold">
                  R$ {promo.currentPrice.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-500 px-2 py-1 rounded-full text-xs font-semibold">
                    <Percent className="w-3 h-3" />
                    {promo.discount}%
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Switch
                      checked={promo.active}
                      onCheckedChange={() => handleTogglePromotion(promo.id)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {promo.active ? "Ativo" : "Inativo"}
                    </span>
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
