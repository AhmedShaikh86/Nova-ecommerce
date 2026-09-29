"use client";

interface Props {
  value: number;
  max: number;
  onChange: (value: number) => void;
}

export function QuantityInput({ value, max, onChange }: Props) {
  return (
    <div className="inline-flex h-10 items-center rounded-full border border-border bg-surface">
      <button
        type="button"
        className="h-full w-10 rounded-l-full text-lg hover:bg-surface-muted disabled:opacity-40"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-medium tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="h-full w-10 rounded-r-full text-lg hover:bg-surface-muted disabled:opacity-40"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
