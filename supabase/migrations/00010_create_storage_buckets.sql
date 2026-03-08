-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('home-photos', 'home-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
    ('equipment-photos', 'equipment-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
    ('completion-photos', 'completion-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']);

-- Storage policies: home-photos
-- Folder convention: {home_id}/{filename}
CREATE POLICY "Home members can view home photos"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'home-photos'
        AND public.is_home_member((string_to_array(name, '/'))[1]::uuid)
    );

CREATE POLICY "Home editors can upload home photos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'home-photos'
        AND public.can_edit_home((string_to_array(name, '/'))[1]::uuid)
    );

CREATE POLICY "Home editors can delete home photos"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'home-photos'
        AND public.can_edit_home((string_to_array(name, '/'))[1]::uuid)
    );

-- Storage policies: equipment-photos
-- Folder convention: {home_id}/{equipment_id}/{filename}
CREATE POLICY "Home members can view equipment photos"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'equipment-photos'
        AND public.is_home_member((string_to_array(name, '/'))[1]::uuid)
    );

CREATE POLICY "Home editors can upload equipment photos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'equipment-photos'
        AND public.can_edit_home((string_to_array(name, '/'))[1]::uuid)
    );

CREATE POLICY "Home editors can delete equipment photos"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'equipment-photos'
        AND public.can_edit_home((string_to_array(name, '/'))[1]::uuid)
    );

-- Storage policies: completion-photos
-- Folder convention: {home_id}/{completion_id}/{filename}
CREATE POLICY "Home members can view completion photos"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'completion-photos'
        AND public.is_home_member((string_to_array(name, '/'))[1]::uuid)
    );

CREATE POLICY "Home editors can upload completion photos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'completion-photos'
        AND public.can_edit_home((string_to_array(name, '/'))[1]::uuid)
    );
