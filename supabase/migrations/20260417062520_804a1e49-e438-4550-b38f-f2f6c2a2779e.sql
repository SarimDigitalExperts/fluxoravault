-- Flash sale support on products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS flash_sale_price numeric,
  ADD COLUMN IF NOT EXISTS flash_sale_starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS flash_sale_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS preview_video_url text,
  ADD COLUMN IF NOT EXISTS preview_demo_url text;

-- Site settings (key/value) for WhatsApp number, support email, etc.
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings readable by everyone"
ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Admins manage settings"
ON public.site_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Seed support contact settings
INSERT INTO public.site_settings (key, value) VALUES
  ('whatsapp_number', '+447907269967'),
  ('support_email', 'support@signifyvault.com'),
  ('site_name', 'Signify Vault')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Update blogs RLS so published blogs are public (already exists; ensure)
-- Already handled.

-- Coupons: support applying to products vs subscriptions
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS applies_to text NOT NULL DEFAULT 'all';

-- updated_at trigger for site_settings
CREATE OR REPLACE TRIGGER set_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();