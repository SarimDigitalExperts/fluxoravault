import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Repeat, Infinity as InfinityIcon } from "lucide-react";

export interface ProductVariation {
  id: string;
  product_id: string;
  label: string | null;
  options: Record<string, string>;
  price: number;
  original_price: number | null;
  duration_type: string; // onetime | monthly | yearly | weekly | custom
  duration_days: number | null;
  badge: string | null;
  stock: number | null;
  is_default: boolean;
  is_active: boolean;
  display_order: number;
}

interface Props {
  variations: ProductVariation[];
  selectedId: string | null;
  onChange: (id: string) => void;
}

function variationName(v: ProductVariation) {
  if (v.label && v.label.trim()) return v.label;
  const opts = Object.values(v.options || {}).filter(Boolean);
  if (opts.length) return opts.join(" · ");
  return v.duration_type.charAt(0).toUpperCase() + v.duration_type.slice(1);
}

function durationLabel(v: ProductVariation) {
  switch (v.duration_type) {
    case "monthly": return "/ month";
    case "yearly": return "/ year";
    case "weekly": return "/ week";
    case "custom": return v.duration_days ? `/ ${v.duration_days} days` : "";
    default: return " (one-time)";
  }
}

function DurationIcon({ type }: { type: string }) {
  if (type === "onetime") return <InfinityIcon className="h-3.5 w-3.5" />;
  if (type === "custom") return <Clock className="h-3.5 w-3.5" />;
  return <Repeat className="h-3.5 w-3.5" />;
}

export default function ProductVariationPicker({ variations, selectedId, onChange }: Props) {
  const active = variations.filter((v) => v.is_active);
  if (active.length === 0) return null;

  const selected = active.find((v) => v.id === selectedId) || active[0];
  const discount = selected.original_price && selected.original_price > selected.price
    ? Math.round((1 - selected.price / selected.original_price) * 100)
    : null;

  return (
    <div className="rounded-md border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Choose option
        </p>
        {selected.badge && (
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
            {selected.badge}
          </Badge>
        )}
      </div>

      <Select value={selected.id} onValueChange={onChange}>
        <SelectTrigger className="rounded-md h-12 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-background">
          {active.map((v) => (
            <SelectItem key={v.id} value={v.id} className="py-2.5">
              <div className="flex items-center gap-2 w-full">
                <DurationIcon type={v.duration_type} />
                <span className="font-medium">{variationName(v)}</span>
                <span className="text-muted-foreground text-xs ml-auto pl-3">
                  PKR {v.price.toLocaleString()}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Price summary */}
      <div className="flex items-baseline gap-2 pt-1">
        <span className="text-2xl font-display font-extrabold">
          PKR {selected.price.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground">{durationLabel(selected)}</span>
        {selected.original_price && selected.original_price > selected.price && (
          <span className="text-sm text-muted-foreground line-through ml-1">
            PKR {selected.original_price.toLocaleString()}
          </span>
        )}
        {discount && (
          <Badge className="bg-green-500/10 text-green-600 border-green-200 text-[10px] ml-auto">
            Save {discount}%
          </Badge>
        )}
      </div>

      {selected.stock !== null && selected.stock !== undefined && (
        <p className="text-[11px] text-muted-foreground">
          {selected.stock > 0 ? `${selected.stock} in stock` : "Out of stock"}
        </p>
      )}
    </div>
  );
}

export function variationDisplayName(v: ProductVariation) {
  return variationName(v);
}