import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function WhatsAppButton() {
  const [number, setNumber] = useState<string>("+447907269967");

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "whatsapp_number").maybeSingle()
      .then(({ data }) => { if (data?.value) setNumber(data.value); });
  }, []);

  const cleanNumber = number.replace(/[^\d]/g, "") || "447907269967";
  const message = encodeURIComponent("Hi Fluxora Mart, I need help with");
  const href = `https://wa.me/${cleanNumber}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
    >
      <svg viewBox="0 0 32 32" className="h-8 w-8" fill="currentColor" aria-hidden="true">
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.33.244-.713.244-1.087 0-.4-.13-.7-.43-.93-.402-.302-1.06-.516-1.45-.66-.244-.087-.402-.144-.487-.144zM16.063 4C9.484 4 4 9.484 4 16.063c0 2.207.616 4.358 1.788 6.222L4.044 28l5.873-1.717c1.79 1.06 3.834 1.62 5.916 1.62 6.578 0 12.062-5.484 12.062-12.062 0-3.16-1.275-6.193-3.55-8.453C22.078 5.18 19.16 4 16.062 4zm0 22.18c-1.94 0-3.84-.587-5.452-1.66l-.387-.244-3.553 1.06.96-3.46-.244-.387c-1.146-1.747-1.747-3.726-1.747-5.804 0-5.86 4.787-10.643 10.638-10.643 2.836 0 5.5 1.116 7.504 3.116 1.99 1.99 3.144 4.668 3.144 7.504-.014 5.86-4.797 10.518-10.866 10.518z"/>
      </svg>
    </a>
  );
}
