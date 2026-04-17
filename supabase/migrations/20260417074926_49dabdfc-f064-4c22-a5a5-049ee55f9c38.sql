
DROP POLICY IF EXISTS "Admins manage redemptions" ON public.coupon_redemptions;

CREATE POLICY "Admins view all redemptions" ON public.coupon_redemptions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update redemptions" ON public.coupon_redemptions
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete redemptions" ON public.coupon_redemptions
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
