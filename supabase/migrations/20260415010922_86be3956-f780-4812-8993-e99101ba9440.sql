
-- Add new columns to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS delivery_type text NOT NULL DEFAULT 'file',
  ADD COLUMN IF NOT EXISTS file_url text,
  ADD COLUMN IF NOT EXISTS file_size text,
  ADD COLUMN IF NOT EXISTS download_link text,
  ADD COLUMN IF NOT EXISTS qr_image_url text,
  ADD COLUMN IF NOT EXISTS qr_target_url text,
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_trending boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_approval boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS max_downloads_per_user integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS download_expiry_days integer,
  ADD COLUMN IF NOT EXISTS os_compatibility text,
  ADD COLUMN IF NOT EXISTS version text DEFAULT '1.0';

-- Create license_keys table
CREATE TABLE public.license_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  key_value text NOT NULL,
  is_used boolean NOT NULL DEFAULT false,
  assigned_to uuid,
  assigned_order_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage license keys"
  ON public.license_keys FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view own license keys"
  ON public.license_keys FOR SELECT
  USING (auth.uid() = assigned_to);

CREATE TRIGGER update_license_keys_updated_at
  BEFORE UPDATE ON public.license_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create private storage bucket for product files
INSERT INTO storage.buckets (id, name, public) VALUES ('product-files', 'product-files', false)
  ON CONFLICT (id) DO NOTHING;

-- Only admins can upload product files
CREATE POLICY "Admins upload product files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage product files"
  ON storage.objects FOR ALL
  USING (bucket_id = 'product-files' AND public.has_role(auth.uid(), 'admin'));

-- Authenticated users with approved orders can download (handled via signed URLs in code)
CREATE POLICY "Auth users read product files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-files' AND auth.role() = 'authenticated');
