import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { exportCSV, importCSV } from "@/lib/csv";

type TableName = "products" | "orders" | "categories" | "coupons" | "banners" | "blogs"
  | "payment_methods" | "contact_messages" | "subscriptions" | "profiles";

interface Options<T> {
  table: TableName;
  rows: T[];
  refresh: () => void | Promise<void>;
  searchKeys?: (keyof T)[];
  exportColumns?: (keyof T)[];
  importPrepare?: (row: any) => any | null;
}

export function useAdminTable<T extends { id: string }>({
  table, rows, refresh, searchKeys = [], exportColumns, importPrepare,
}: Options<T>) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      searchKeys.some((k) => {
        const v = (r as any)[k];
        return v != null && String(v).toLowerCase().includes(q);
      })
    );
  }, [rows, search, searchKeys]);

  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(filtered.map((r) => r.id)));
  const toggleOne = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} item(s)? This cannot be undone.`)) return;
    const { error } = await supabase.from(table).delete().in("id", Array.from(selected));
    if (error) { toast.error(error.message); return; }
    toast.success(`Deleted ${selected.size}`);
    setSelected(new Set());
    refresh();
  };

  const handleExport = () => {
    const data = filtered.map((r) => {
      if (!exportColumns) return r;
      const out: any = {};
      exportColumns.forEach((k) => (out[k as string] = (r as any)[k]));
      return out;
    });
    exportCSV(data as any, `${table}.csv`);
    toast.success(`Exported ${data.length} rows`);
  };

  const handleImport = async (file: File) => {
    try {
      const raw: any[] = await importCSV(file);
      const valid = raw
        .map((r) => (importPrepare ? importPrepare(r) : r))
        .filter((r) => r != null);
      if (valid.length === 0) { toast.error("No valid rows in CSV"); return; }
      const { error } = await supabase.from(table).insert(valid);
      if (error) throw error;
      toast.success(`Imported ${valid.length} rows`);
      refresh();
    } catch (e: any) {
      toast.error(e.message || "Import failed");
    }
  };

  return {
    search, setSearch, selected, setSelected, filtered,
    allSelected, toggleAll, toggleOne, bulkDelete, handleExport, handleImport,
  };
}
