import { useState } from "react";
import { Flame, X } from "lucide-react";

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-primary to-secondary text-primary-foreground text-center text-xs font-medium py-1.5 px-8">
      <span className="inline-flex items-center gap-1.5">
        <Flame className="h-3.5 w-3.5" />
        50% OFF on Premium Templates — Limited Time! Use code <strong className="ml-1">FLUXORA50</strong>
      </span>
      <button onClick={() => setVisible(false)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
