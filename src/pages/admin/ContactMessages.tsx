import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, Eye, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";
import AdminToolbar from "@/components/admin/AdminToolbar";
import { useAdminTable } from "@/hooks/useAdminTable";

export default function AdminContactMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    setMessages(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const markRead = async (id: string) => { await supabase.from("contact_messages").update({ is_read: true }).eq("id", id); fetchData(); };
  const handleDelete = async (id: string) => { await supabase.from("contact_messages").delete().eq("id", id); toast.success("Deleted"); fetchData(); };
  const openMessage = (m: any) => { setSelected(m); if (!m.is_read) markRead(m.id); };
  const unreadCount = messages.filter((m) => !m.is_read).length;

  const tbl = useAdminTable<any>({
    table: "contact_messages", rows: messages, refresh: fetchData,
    searchKeys: ["name", "email", "subject", "message"],
    exportColumns: ["name","email","subject","message","is_read","created_at"],
  });

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" /> Messages ({messages.length})
          {unreadCount > 0 && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{unreadCount} new</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AdminToolbar searchQuery={tbl.search} onSearchChange={tbl.setSearch} searchPlaceholder="Search messages..."
          selectedCount={tbl.selected.size} onBulkDelete={tbl.bulkDelete} onExport={tbl.handleExport} />
        {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : tbl.filtered.length === 0 ? <p className="text-sm text-muted-foreground">No messages found.</p> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead className="w-10"><Checkbox checked={tbl.allSelected} onCheckedChange={tbl.toggleAll} /></TableHead>
              <TableHead>From</TableHead><TableHead>Subject</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {tbl.filtered.map((m) => (
                <TableRow key={m.id} className={!m.is_read ? "bg-primary/5" : ""} data-state={tbl.selected.has(m.id) ? "selected" : undefined}>
                  <TableCell><Checkbox checked={tbl.selected.has(m.id)} onCheckedChange={() => tbl.toggleOne(m.id)} /></TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                  </TableCell>
                  <TableCell className="text-sm">{m.subject || "No subject"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => openMessage(m)}><Eye className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={!!selected} onOpenChange={(v) => { if (!v) setSelected(null); }}>
          <DialogContent>
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Mail className="h-4 w-4" /> {selected?.subject || "Message"}</DialogTitle></DialogHeader>
            {selected && (
              <div className="space-y-3">
                <div className="text-sm"><span className="text-muted-foreground">From:</span> {selected.name} ({selected.email})</div>
                <div className="text-sm"><span className="text-muted-foreground">Date:</span> {new Date(selected.created_at).toLocaleString()}</div>
                <div className="bg-muted rounded-lg p-4 text-sm whitespace-pre-wrap">{selected.message}</div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
