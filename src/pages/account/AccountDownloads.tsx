import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Download, Lock, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AccountDownloads() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: downloads = [], isLoading } = useQuery({
    queryKey: ["user-downloads", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("downloads")
        .select("*, products(title, image, slug, category)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const handleDownload = (dl: any) => {
    if (dl.download_count >= dl.max_downloads) {
      toast({ title: "Download limit reached", description: "You've used all available downloads for this product.", variant: "destructive" });
      return;
    }
    if (dl.download_url) {
      window.open(dl.download_url, "_blank");
    } else {
      toast({ title: "Download unavailable", description: "The download link is not ready yet.", variant: "destructive" });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-2">Downloads</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Downloads are available after purchasing a product or subscribing to a plan.
      </p>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : downloads.length === 0 ? (
        <div className="glass-strong rounded-2xl p-12 text-center">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-1">No downloads yet</p>
          <p className="text-sm text-muted-foreground">Purchase a product to unlock downloads</p>
        </div>
      ) : (
        <div className="space-y-3">
          {downloads.map((dl: any) => (
            <div key={dl.id} className="glass-strong rounded-2xl p-5 flex items-center gap-4">
              {dl.products?.image && (
                <img src={dl.products.image} alt="" className="w-14 h-14 rounded-xl object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{dl.products?.title || "Product"}</p>
                <p className="text-xs text-muted-foreground">
                  {dl.products?.category} · {dl.download_count}/{dl.max_downloads} downloads used
                </p>
              </div>
              <Button
                size="sm"
                variant={dl.download_count >= dl.max_downloads ? "ghost-border" : "glow"}
                onClick={() => handleDownload(dl)}
                disabled={dl.download_count >= dl.max_downloads}
              >
                <FileDown className="h-4 w-4 mr-1" />
                {dl.download_count >= dl.max_downloads ? "Limit reached" : "Download"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
