
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  user_id uuid,
  reviewer_name text NOT NULL DEFAULT 'Anonymous',
  rating integer NOT NULL DEFAULT 5,
  comment text NOT NULL DEFAULT '',
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved reviews viewable by everyone"
  ON public.reviews FOR SELECT
  USING (is_approved = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users create reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage reviews"
  ON public.reviews FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
