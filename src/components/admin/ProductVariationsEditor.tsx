import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Tag, Layers, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AttrValue { id?: string; value: string; display_order: number; }
interface Attr { id?: string; name: string; display_order: number; values: AttrValue[]; }

interface Variation {
  id?: string;
  label: string | null;
  options: Record<string, string>;
  price: number;
  original_price: number | null;
  duration_type: string;
  duration_days: number | null;
  badge: string | null;
  stock: number | null;
  is_default: boolean;
  is_active: boolean;
  display_order: number;
}

interface Props {
  productId: string | null; // null when creating a new product (variations saved later)
}

const DURATION_OPTIONS = [
  { value: "onetime", label: "One-time (Lifetime)" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom (days)" },
];

export default function ProductVariationsEditor({ productId }: Props) {
  const { toast } = useToast();
  const [attributes, setAttributes] = useState<Attr[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    const { data: attrs } = await supabase
      .from("product_variation_attributes")
      .select("*, product_variation_attribute_values(*)")
      .eq("product_id", productId)
      .order("display_order");
    const { data: vars } = await supabase
      .from("product_variations")
      .select("*")
      .eq("product_id", productId)
      .order("display_order");
    setAttributes(
      (attrs || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        display_order: a.display_order,
        values: (a.product_variation_attribute_values || [])
          .sort((x: any, y: any) => x.display_order - y.display_order)
          .map((v: any) => ({ id: v.id, value: v.value, display_order: v.display_order })),
      }))
    );
    setVariations(
      (vars || []).map((v: any) => ({
        id: v.id,
        label: v.label,
        options: v.options || {},
        price: Number(v.price),
        original_price: v.original_price ? Number(v.original_price) : null,
        duration_type: v.duration_type || "onetime",
        duration_days: v.duration_days,
        badge: v.badge,
        stock: v.stock,
        is_default: !!v.is_default,
        is_active: v.is_active !== false,
        display_order: v.display_order || 0,
      }))
    );
    setLoading(false);
  }, [productId]);

  useEffect(() => { load(); }, [load]);

  // ---- Attribute editing ----
  const addAttribute = () => {
    setAttributes((a) => [...a, { name: "Duration", display_order: a.length, values: [] }]);
  };
  const updateAttribute = (i: number, patch: Partial<Attr>) => {
    setAttributes((a) => a.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  };
  const removeAttribute = (i: number) => setAttributes((a) => a.filter((_, idx) => idx !== i));
  const addAttrValue = (i: number, value: string) => {
    if (!value.trim()) return;
    setAttributes((a) => a.map((x, idx) => idx === i ? {
      ...x,
      values: [...x.values, { value: value.trim(), display_order: x.values.length }],
    } : x));
  };
  const removeAttrValue = (i: number, j: number) => {
    setAttributes((a) => a.map((x, idx) => idx === i ? {
      ...x, values: x.values.filter((_, k) => k !== j),
    } : x));
  };

  // ---- Variation editing ----
  const addVariation = () => {
    const opts: Record<string, string> = {};
    attributes.forEach(a => { if (a.values[0]) opts[a.name] = a.values[0].value; });
    setVariations((v) => [...v, {
      label: null, options: opts, price: 0, original_price: null,
      duration_type: "onetime", duration_days: null, badge: null,
      stock: null, is_default: v.length === 0, is_active: true,
      display_order: v.length,
    }]);
  };
  const updateVariation = (i: number, patch: Partial<Variation>) => {
    setVariations((v) => v.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  };
  const updateVariationOption = (i: number, attrName: string, value: string) => {
    setVariations((v) => v.map((x, idx) => idx === i ? { ...x, options: { ...x.options, [attrName]: value } } : x));
  };
  const removeVariation = (i: number) => setVariations((v) => v.filter((_, idx) => idx !== i));
  const setDefault = (i: number) => setVariations((v) => v.map((x, idx) => ({ ...x, is_default: idx === i })));

  const generateAllCombos = () => {
    if (attributes.length === 0 || attributes.some(a => a.values.length === 0)) {
      toast({ title: "Add attribute values first", variant: "destructive" });
      return;
    }
    const cartesian = (arrs: string[][]): string[][] =>
      arrs.reduce<string[][]>((acc, arr) => acc.flatMap(c => arr.map(v => [...c, v])), [[]]);
    const valueArrays = attributes.map(a => a.values.map(v => v.value));
    const combos = cartesian(valueArrays);
    const newVars: Variation[] = combos.map((combo, idx) => {
      const opts: Record<string, string> = {};
      attributes.forEach((a, k) => { opts[a.name] = combo[k]; });
      return {
        label: null, options: opts, price: 0, original_price: null,
        duration_type: "onetime", duration_days: null, badge: null, stock: null,
        is_default: idx === 0, is_active: true, display_order: idx,
      };
    });
    setVariations(newVars);
    toast({ title: `Generated ${newVars.length} variation${newVars.length === 1 ? "" : "s"}` });
  };

  const handleSave = async () => {
    if (!productId) {
      toast({ title: "Save the product first", description: "Variations need a saved product to attach to.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      // 1) Replace attributes (delete + reinsert is simplest for now)
      await supabase.from("product_variation_attributes").delete().eq("product_id", productId);
      for (let i = 0; i < attributes.length; i++) {
        const a = attributes[i];
        const { data: inserted } = await supabase
          .from("product_variation_attributes")
          .insert({ product_id: productId, name: a.name, display_order: i })
          .select().single();
        if (inserted && a.values.length > 0) {
          await supabase.from("product_variation_attribute_values").insert(
            a.values.map((v, j) => ({ attribute_id: inserted.id, value: v.value, display_order: j }))
          );
        }
      }

      // 2) Replace variations
      await supabase.from("product_variations").delete().eq("product_id", productId);
      if (variations.length > 0) {
        const rows = variations.map((v, i) => ({
          product_id: productId,
          label: v.label,
          options: v.options,
          price: v.price,
          original_price: v.original_price,
          duration_type: v.duration_type,
          duration_days: v.duration_days,
          badge: v.badge,
          stock: v.stock,
          is_default: v.is_default,
          is_active: v.is_active,
          display_order: i,
        }));
        const { error } = await supabase.from("product_variations").insert(rows);
        if (error) throw error;
      }
      toast({ title: "Variations saved" });
      load();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!productId) {
    return (
      <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Save the product first, then come back to this tab to add variations.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ATTRIBUTES */}
      <div className="rounded-md border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <p className="font-semibold text-sm">Attributes (axes)</p>
          </div>
          <Button size="sm" variant="outline" onClick={addAttribute}>
            <Plus className="h-3 w-3 mr-1" /> Add Attribute
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mb-4">
          Define options like <strong>Duration</strong> (Monthly, Yearly), <strong>Tier</strong> (Personal, Team), or any custom axis.
        </p>

        <div className="space-y-3">
          {attributes.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No attributes yet — add one to define variation axes.</p>
          )}
          {attributes.map((attr, i) => (
            <div key={i} className="rounded-md border border-border p-3 bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={attr.name}
                  onChange={(e) => updateAttribute(i, { name: e.target.value })}
                  placeholder="Attribute name (e.g. Duration)"
                  className="text-sm h-8"
                />
                <Button variant="ghost" size="icon" onClick={() => removeAttribute(i)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {attr.values.map((v, j) => (
                  <Badge key={j} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeAttrValue(i, j)}>
                    {v.value} <Trash2 className="h-2.5 w-2.5" />
                  </Badge>
                ))}
              </div>
              <NewValueInput onAdd={(val) => addAttrValue(i, val)} />
            </div>
          ))}
        </div>
      </div>

      {/* VARIATIONS */}
      <div className="rounded-md border border-border p-4">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <p className="font-semibold text-sm">Variations ({variations.length})</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={generateAllCombos} disabled={attributes.length === 0}>
              Generate All Combos
            </Button>
            <Button size="sm" variant="outline" onClick={addVariation}>
              <Plus className="h-3 w-3 mr-1" /> Add Variation
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {variations.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              No variations yet. The product will use its base price. Add a variation to offer multiple options.
            </p>
          )}
          {variations.map((v, i) => (
            <div key={i} className="rounded-md border border-border p-4 bg-card space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {Object.entries(v.options).map(([k, val]) => (
                    <Badge key={k} variant="outline" className="text-[10px]">
                      {k}: {val}
                    </Badge>
                  ))}
                  {v.is_default && <Badge className="bg-primary text-primary-foreground text-[10px]">Default</Badge>}
                </div>
                <div className="flex items-center gap-1">
                  {!v.is_default && (
                    <Button variant="ghost" size="sm" onClick={() => setDefault(i)} className="h-7 text-[11px]">
                      Set Default
                    </Button>
                  )}
                  <Switch checked={v.is_active} onCheckedChange={(val) => updateVariation(i, { is_active: val })} />
                  <Button variant="ghost" size="icon" onClick={() => removeVariation(i)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>

              {/* Per-attribute selectors */}
              {attributes.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {attributes.map((a) => (
                    <div key={a.name}>
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{a.name}</Label>
                      <Select
                        value={v.options[a.name] || ""}
                        onValueChange={(val) => updateVariationOption(i, a.name, val)}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                        <SelectContent className="bg-background">
                          {a.values.map((vv) => (
                            <SelectItem key={vv.value} value={vv.value}>{vv.value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}

              {/* Pricing + Duration row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Price (PKR)</Label>
                  <Input type="number" value={v.price} onChange={(e) => updateVariation(i, { price: +e.target.value })} className="h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Original</Label>
                  <Input type="number" value={v.original_price ?? ""} onChange={(e) => updateVariation(i, { original_price: +e.target.value || null })} className="h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Duration</Label>
                  <Select value={v.duration_type} onValueChange={(val) => updateVariation(i, { duration_type: val })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-background">
                      {DURATION_OPTIONS.map(d => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {v.duration_type === "custom" && (
                  <div>
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Days</Label>
                    <Input type="number" value={v.duration_days ?? ""} onChange={(e) => updateVariation(i, { duration_days: +e.target.value || null })} className="h-8 text-xs" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Badge</Label>
                  <Input value={v.badge ?? ""} onChange={(e) => updateVariation(i, { badge: e.target.value || null })} placeholder="Most Popular" className="h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Stock</Label>
                  <Input type="number" value={v.stock ?? ""} onChange={(e) => updateVariation(i, { stock: +e.target.value || null })} placeholder="Unlimited" className="h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Custom Label</Label>
                  <Input value={v.label ?? ""} onChange={(e) => updateVariation(i, { label: e.target.value || null })} placeholder="Override name" className="h-8 text-xs" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || loading}>
          <Save className="h-4 w-4 mr-1" />
          {saving ? "Saving..." : "Save Variations"}
        </Button>
      </div>
    </div>
  );
}

function NewValueInput({ onAdd }: { onAdd: (v: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2">
      <Input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAdd(val);
            setVal("");
          }
        }}
        placeholder="Add value (e.g. Monthly) — press Enter"
        className="h-8 text-xs"
      />
      <Button size="sm" variant="outline" onClick={() => { onAdd(val); setVal(""); }}>
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}