import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CartItem } from "./CartItem";
import { Separator } from "@/components/ui/separator";

export const CartButton = () => {
  const { items, total, itemCount } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 z-[9999] h-14 w-14 rounded-full shadow-lg"
        >
          <ShoppingCart className="h-6 w-6" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Seu Pedido</SheetTitle>
          <SheetDescription>
            {itemCount} {itemCount === 1 ? "item" : "itens"} no carrinho
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Seu carrinho está vazio
            </p>
          ) : (
            items.map((item) => <CartItem key={item.id} item={item} />)
          )}
        </div>
        {items.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <Button className="w-full" size="lg">
                Finalizar Pedido
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
