-- Ajouter les secteurs Têtes de lit et Marine
INSERT INTO public.sectors (name, slug, description, is_active, display_order, icon) 
VALUES 
  (
    'Têtes de Lit',
    'tetes-de-lit',
    'Création et restauration de têtes de lit sur mesure. Expertise artisanale pour un confort et une élégance incomparables.',
    true,
    10,
    '🛏️'
  ),
  (
    'Marine',
    'marine',
    'Expertise nautique pour l''entretien et la restauration du cuir marin. Solutions durables résistantes à l''environnement maritime.',
    true,
    11,
    '⚓'
  )
ON CONFLICT (slug) DO NOTHING;