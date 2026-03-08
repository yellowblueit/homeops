-- Seed equipment categories
INSERT INTO public.equipment_categories (name, slug, icon, display_order) VALUES
    ('HVAC', 'hvac', 'thermometer', 1),
    ('Plumbing', 'plumbing', 'droplets', 2),
    ('Electrical', 'electrical', 'zap', 3),
    ('Appliances', 'appliances', 'refrigerator', 4),
    ('Outdoor / Landscaping', 'outdoor', 'trees', 5),
    ('Structural', 'structural', 'building', 6),
    ('Roofing', 'roofing', 'home', 7),
    ('Flooring', 'flooring', 'layers', 8),
    ('Windows & Doors', 'windows-doors', 'door-open', 9),
    ('Safety & Security', 'safety', 'shield', 10),
    ('Pool & Spa', 'pool-spa', 'waves', 11),
    ('Garage', 'garage', 'warehouse', 12),
    ('Other', 'other', 'wrench', 99);
