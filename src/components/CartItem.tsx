import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  };
}

export const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-3 p-3 bg-secondary rounded-lg">
      <img
        src={item.image}
        alt={item.name}
        className="w-20 h-20 object-cover rounded-md"
      />
      <div className="flex-1 space-y-2">
        <h4 className="font-semibold text-sm">{item.name}</h4>
        <p className="text-primary font-bold">R$ {item.price.toFixed(2)}</p>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center font-semibold">{item.quantity}</span>
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 ml-auto text-destructive"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
