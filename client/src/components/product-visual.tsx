import type { Category } from "@/lib/types";
import { CategoryIcon } from "./icons";

const gradients: Record<Category, string> = {
  laptops: "from-indigo-500/15 via-sky-500/10 to-transparent",
  headphones: "from-rose-500/15 via-fuchsia-500/10 to-transparent",
  keyboards: "from-amber-500/15 via-orange-500/10 to-transparent",
  mice: "from-emerald-500/15 via-teal-500/10 to-transparent",
  monitors: "from-violet-500/15 via-indigo-500/10 to-transparent",
  accessories: "from-cyan-500/15 via-blue-500/10 to-transparent",
};

interface Props {
  category: Category;
  image?: string;
  name: string;
  className?: string;
  iconSize?: number;
}

/** Shows the product image, or a styled category illustration when none is set. */
export function ProductVisual({ category, image, name, className = "", iconSize = 56 }: Props) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-surface-muted bg-gradient-to-br ${gradients[category]} ${className}`}
    >
      {image ? (
        // Admin-provided URLs can point at any host, so a plain <img> is used instead of next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <CategoryIcon
          category={category}
          width={iconSize}
          height={iconSize}
          strokeWidth={1.25}
          className="text-foreground/70"
        />
      )}
    </div>
  );
}
