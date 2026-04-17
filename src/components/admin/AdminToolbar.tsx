import { Search, Download, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef } from "react";

interface Props {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  selectedCount: number;
  onBulkDelete?: () => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
  rightSlot?: React.ReactNode;
}

export default function AdminToolbar({
  searchQuery, onSearchChange, searchPlaceholder = "Search...",
  selectedCount, onBulkDelete, onExport, onImport, rightSlot,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={searchPlaceholder} value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="pl-9" />
      </div>
      {rightSlot}
      {selectedCount > 0 && onBulkDelete && (
        <Button variant="destructive" size="sm" onClick={onBulkDelete}>
          <Trash2 className="h-4 w-4 mr-1" /> Delete ({selectedCount})
        </Button>
      )}
      {onExport && (
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-1" /> Export CSV
        </Button>
      )}
      {onImport && (
        <>
          <input ref={fileRef} type="file" accept=".csv" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) { onImport(f); e.target.value = ""; } }} />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" /> Import CSV
          </Button>
        </>
      )}
    </div>
  );
}
