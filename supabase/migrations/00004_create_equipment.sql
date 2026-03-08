-- Create equipment categories (reference/seed data)
CREATE TABLE public.equipment_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create equipment table
CREATE TABLE public.equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_id UUID NOT NULL REFERENCES public.homes(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.equipment_categories(id),
    name TEXT NOT NULL,
    manufacturer TEXT,
    model_number TEXT,
    serial_number TEXT,
    manufacture_date DATE,
    installed_date DATE,
    warranty_expiration DATE,
    warranty_details TEXT,
    location_in_home TEXT,
    description TEXT,
    notes TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'replaced', 'removed')),
    -- AI-enriched fields
    manual_url TEXT,
    manual_cached_data JSONB,
    recall_status TEXT DEFAULT 'none' CHECK (recall_status IN ('none', 'checking', 'recalled', 'clear')),
    recall_data JSONB,
    recall_last_checked TIMESTAMPTZ,
    ai_maintenance_suggestions JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_equipment_home ON public.equipment(home_id);
CREATE INDEX idx_equipment_category ON public.equipment(category_id);
CREATE INDEX idx_equipment_status ON public.equipment(status);

CREATE TRIGGER equipment_updated_at
    BEFORE UPDATE ON public.equipment
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Create equipment photos table
CREATE TABLE public.equipment_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    caption TEXT,
    is_primary BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_equipment_photos_equipment ON public.equipment_photos(equipment_id);
