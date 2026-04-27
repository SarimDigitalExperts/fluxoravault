-- Seed categories
INSERT INTO public.categories (name, slug, icon, display_order, is_active) VALUES
('Logos & Branding','logos-branding','Sparkles',0,true),
('Web Templates','web-templates','Layout',1,true),
('UI Kits','ui-kits','LayoutGrid',2,true),
('Mockups','mockups','Image',3,true),
('Icons','icons','Star',4,true),
('Fonts','fonts','Type',5,true),
('Presentations','presentations','Presentation',6,true),
('Social Media','social-media','Share2',7,true),
('Print Templates','print-templates','Printer',8,true),
('Illustrations','illustrations','Palette',9,true),
('3D Assets','3d-assets','Box',10,true),
('Video Templates','video-templates','Video',11,true),
('Photoshop Actions','photoshop-actions','Wand2',12,true),
('Lightroom Presets','lightroom-presets','Camera',13,true),
('Notion Templates','notion-templates','FileText',14,true)
ON CONFLICT (slug) DO NOTHING;