import { useState } from "react";

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-primary to-secondary text-primary-foreground text-center text-xs font-medium py-1.5 px-4">
      <span>🔥 50% OFF on Premium Tools — Limited Time! Use code <strong>ORBIT50</strong></span>
      <button onClick={() => setVisible(false)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}
