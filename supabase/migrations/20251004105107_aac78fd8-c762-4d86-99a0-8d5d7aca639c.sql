-- Add Tapissier sector
INSERT INTO public.sectors (name, slug, description, is_active, display_order)
VALUES (
  'Tapissier – Réparation & Habillage',
  'tapissier',
  'Expertise en tapisserie d''ameublement : réparation, habillage et création sur mesure',
  true,
  6
)
ON CONFLICT (slug) DO NOTHING;