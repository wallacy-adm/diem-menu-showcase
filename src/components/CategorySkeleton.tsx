import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

export const CategorySkeleton = () => {
  return (
    <section className="mb-10">
      <Skeleton className="h-7 w-40 mb-5" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </div>
    </section>
  );
};
