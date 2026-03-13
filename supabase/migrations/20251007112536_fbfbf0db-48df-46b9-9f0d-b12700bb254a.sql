-- Insert Coloration sector
INSERT INTO public.sectors (name, slug, description, icon, display_order, is_active)
VALUES (
  'Coloration Cuir',
  'coloration-cuir',
  'Service de coloration et teinture du cuir professionnel',
  '🎨',
  5,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  is_active = EXCLUDED.is_active;