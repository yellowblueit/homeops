-- Create homes table
CREATE TABLE public.homes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    year_built INTEGER,
    square_footage INTEGER,
    lot_size_sqft INTEGER,
    home_type TEXT CHECK (home_type IN (
        'single_family', 'townhouse', 'condo', 'multi_family',
        'mobile_home', 'apartment', 'other'
    )),
    stories INTEGER,
    bedrooms INTEGER,
    bathrooms NUMERIC(3,1),
    garage_type TEXT CHECK (garage_type IN ('attached', 'detached', 'carport', 'none')),
    garage_spaces INTEGER DEFAULT 0,
    roof_type TEXT,
    exterior_type TEXT,
    heating_type TEXT,
    cooling_type TEXT,
    foundation_type TEXT,
    notes TEXT,
    exterior_photo_url TEXT,
    aerial_photo_url TEXT,
    property_data_source JSONB,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_homes_owner ON public.homes(owner_id);

CREATE TRIGGER homes_updated_at
    BEFORE UPDATE ON public.homes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Create home_members table for multi-tenancy
CREATE TABLE public.home_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_id UUID NOT NULL REFERENCES public.homes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'contributor', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(home_id, user_id)
);

CREATE INDEX idx_home_members_user ON public.home_members(user_id);
CREATE INDEX idx_home_members_home ON public.home_members(home_id);

CREATE TRIGGER home_members_updated_at
    BEFORE UPDATE ON public.home_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Auto-add owner as member when home is created
CREATE OR REPLACE FUNCTION public.handle_new_home()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.home_members (home_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_home_created
    AFTER INSERT ON public.homes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_home();
