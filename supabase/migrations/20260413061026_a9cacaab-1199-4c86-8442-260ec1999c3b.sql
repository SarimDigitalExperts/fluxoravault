
DROP POLICY "Anyone can submit contact message" ON public.contact_messages;
CREATE POLICY "Authenticated users submit contact messages" ON public.contact_messages FOR INSERT TO authenticated WITH CHECK (true);
