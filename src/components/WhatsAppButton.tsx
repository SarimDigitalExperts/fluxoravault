import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const [number, setNumber] = useState<string>("+447907269967");

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "whatsapp_number").maybeSingle()
      .then(({ data }) => { if (data?.value) setNumber(data.value); });
  }, []);

  const cleanNumber = number.replace(/[^\d]/g, "") || "447907269967";
  const message = encodeURIComponent("Hi Signify Vault, I need help with");
  const href = `https://wa.me/${cleanNumber}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" />
    </a>
  );
}
