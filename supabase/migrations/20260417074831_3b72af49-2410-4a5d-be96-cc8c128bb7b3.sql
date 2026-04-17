
-- Advanced coupon rules
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS per_user_limit integer,
  ADD COLUMN IF NOT EXISTS category_slug text,
  ADD COLUMN IF NOT EXISTS first_order_only boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stackable boolean NOT NULL DEFAULT false;

-- Coupon redemptions tracking (for per-user limits)
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  order_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own redemptions" ON public.coupon_redemptions;
CREATE POLICY "Users view own redemptions" ON public.coupon_redemptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own redemptions" ON public.coupon_redemptions;
CREATE POLICY "Users insert own redemptions" ON public.coupon_redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage redemptions" ON public.coupon_redemptions;
CREATE POLICY "Admins manage redemptions" ON public.coupon_redemptions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Product version tracking
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS version_notes text,
  ADD COLUMN IF NOT EXISTS version_updated_at timestamptz;

-- Trigger: bump version_updated_at when version changes
CREATE OR REPLACE FUNCTION public.bump_product_version_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.version IS DISTINCT FROM OLD.version THEN
    NEW.version_updated_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bump_product_version ON public.products;
CREATE TRIGGER trg_bump_product_version
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.bump_product_version_updated_at();
