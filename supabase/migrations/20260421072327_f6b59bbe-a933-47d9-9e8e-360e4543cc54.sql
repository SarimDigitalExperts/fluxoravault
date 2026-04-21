-- Product Variations System (multi-axis: duration + tier + custom attributes)

-- 1) Variation Attributes (the axes — e.g. "Duration", "Tier", "Seats")
CREATE TABLE public.product_variation_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                  -- e.g. "Duration"
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pva_product ON public.product_variation_attributes(product_id);

-- 2) Attribute Values (e.g. "Monthly", "Yearly", "Lifetime"; "Personal", "Team")
CREATE TABLE public.product_variation_attribute_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_id UUID NOT NULL REFERENCES public.product_variation_attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_pvav_attribute ON public.product_variation_attribute_values(attribute_id);

-- 3) Variations (concrete sellable combinations)
CREATE TABLE public.product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT,
  label TEXT,                          -- optional friendly name override
  options JSONB NOT NULL DEFAULT '{}'::jsonb,  -- { "Duration": "Yearly", "Tier": "Team" }
  price NUMERIC NOT NULL DEFAULT 0,
  original_price NUMERIC,
  duration_type TEXT NOT NULL DEFAULT 'onetime',  -- onetime | monthly | yearly | weekly | custom
  duration_days INTEGER,               -- for "custom" duration
  badge TEXT,                          -- e.g. "Most Popular", "Best Value"
  stock INTEGER,                       -- nullable = unlimited
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pv_product ON public.product_variations(product_id);
CREATE INDEX idx_pv_active ON public.product_variations(product_id, is_active);

-- Updated_at trigger
CREATE TRIGGER trg_product_variations_updated_at
BEFORE UPDATE ON public.product_variations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Add variation reference to order_items
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS variation_id UUID REFERENCES public.product_variations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS variation_label TEXT,
  ADD COLUMN IF NOT EXISTS duration_type TEXT,
  ADD COLUMN IF NOT EXISTS duration_days INTEGER;

-- RLS
ALTER TABLE public.product_variation_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variation_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Variation attributes viewable by everyone"
  ON public.product_variation_attributes FOR SELECT USING (true);

CREATE POLICY "Variation attribute values viewable by everyone"
  ON public.product_variation_attribute_values FOR SELECT USING (true);

CREATE POLICY "Active variations viewable by everyone"
  ON public.product_variations FOR SELECT USING (true);

-- Admin write
CREATE POLICY "Admins manage variation attributes"
  ON public.product_variation_attributes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage variation attribute values"
  ON public.product_variation_attribute_values FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage variations"
  ON public.product_variations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));