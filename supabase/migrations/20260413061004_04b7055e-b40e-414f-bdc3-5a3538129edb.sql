
-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL DEFAULT 0,
  min_order_amount NUMERIC DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can validate coupons" ON public.coupons FOR SELECT TO authenticated USING (is_active = true);

-- Banners table
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  link_url TEXT,
  position TEXT NOT NULL DEFAULT 'home_top',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Banners viewable by everyone" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Admins manage banners" ON public.banners FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Blogs table
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  author_id UUID,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published blogs viewable by everyone" ON public.blogs FOR SELECT USING (is_published = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage blogs" ON public.blogs FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Contact messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage contact messages" ON public.contact_messages FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Payment methods table
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  icon TEXT,
  account_title TEXT,
  account_number TEXT,
  bank_name TEXT,
  phone_number TEXT,
  qr_image_url TEXT,
  instructions TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active payment methods viewable by everyone" ON public.payment_methods FOR SELECT USING (true);
CREATE POLICY "Admins manage payment methods" ON public.payment_methods FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add checkout fields to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_note TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method_id UUID;

-- Storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false);

CREATE POLICY "Users upload own payment proofs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users view own payment proofs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins view all payment proofs" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON public.blogs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default payment methods
INSERT INTO public.payment_methods (name, type, account_title, account_number, bank_name, instructions, display_order) VALUES
('Bank Transfer', 'bank_transfer', 'Orbit Assets', '1234567890', 'HBL Bank', 'Transfer the exact amount and upload your payment proof below.', 1);
INSERT INTO public.payment_methods (name, type, account_title, phone_number, instructions, display_order) VALUES
('Easypaisa', 'easypaisa', 'Orbit Assets', '03001234567', 'Send payment to the number above and upload screenshot.', 2);
INSERT INTO public.payment_methods (name, type, account_title, phone_number, instructions, display_order) VALUES
('SadaPay', 'sadapay', 'Orbit Assets', '03001234567', 'Transfer to the account above and upload proof.', 3);
INSERT INTO public.payment_methods (name, type, instructions, display_order) VALUES
('QR Payment', 'qr_payment', 'Scan the QR code, complete payment, then upload screenshot.', 4);
