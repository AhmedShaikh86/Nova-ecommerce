import { StarIcon } from "./icons";

export function Rating({ value, count }: { value: number; count?: number }) {
  return (
    <div className="flex items-center gap-1 text-sm" aria-label={`Rated ${value} out of 5`}>
      <StarIcon width={14} height={14} className="text-amber-500" />
      <span className="font-medium">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-muted">({count.toLocaleString()})</span>}
    </div>
  );
}
