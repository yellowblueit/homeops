-- ============================================
-- Row Level Security Policies
-- ============================================

-- Helper functions
CREATE OR REPLACE FUNCTION public.is_home_member(check_home_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.home_members
        WHERE home_id = check_home_id
        AND user_id = auth.uid()
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_home_role(check_home_id UUID)
RETURNS TEXT AS $$
    SELECT role FROM public.home_members
    WHERE home_id = check_home_id
    AND user_id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.can_edit_home(check_home_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.home_members
        WHERE home_id = check_home_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'contributor')
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- Profiles ----
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Users can view co-member profiles"
    ON public.profiles FOR SELECT
    USING (
        id IN (
            SELECT hm2.user_id FROM public.home_members hm1
            JOIN public.home_members hm2 ON hm1.home_id = hm2.home_id
            WHERE hm1.user_id = auth.uid()
        )
    );

-- ---- Homes ----
ALTER TABLE public.homes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their homes"
    ON public.homes FOR SELECT
    USING (public.is_home_member(id));

CREATE POLICY "Authenticated users can create homes"
    ON public.homes FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update homes"
    ON public.homes FOR UPDATE
    USING (public.get_home_role(id) = 'owner');

CREATE POLICY "Owners can delete homes"
    ON public.homes FOR DELETE
    USING (public.get_home_role(id) = 'owner');

-- ---- Home Members ----
ALTER TABLE public.home_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view home members"
    ON public.home_members FOR SELECT
    USING (public.is_home_member(home_id));

CREATE POLICY "Owners can add members"
    ON public.home_members FOR INSERT
    WITH CHECK (public.get_home_role(home_id) = 'owner');

CREATE POLICY "Owners can update members"
    ON public.home_members FOR UPDATE
    USING (public.get_home_role(home_id) = 'owner');

CREATE POLICY "Owners can remove members"
    ON public.home_members FOR DELETE
    USING (public.get_home_role(home_id) = 'owner');

-- ---- Invitations ----
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Home owners can manage invitations"
    ON public.invitations FOR ALL
    USING (public.get_home_role(home_id) = 'owner');

CREATE POLICY "Invitees can view their own invitations"
    ON public.invitations FOR SELECT
    USING (
        invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- ---- Equipment Categories (public read) ----
ALTER TABLE public.equipment_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
    ON public.equipment_categories FOR SELECT
    USING (true);

-- ---- Equipment ----
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view equipment"
    ON public.equipment FOR SELECT
    USING (public.is_home_member(home_id));

CREATE POLICY "Contributors+ can add equipment"
    ON public.equipment FOR INSERT
    WITH CHECK (public.can_edit_home(home_id));

CREATE POLICY "Contributors+ can update equipment"
    ON public.equipment FOR UPDATE
    USING (public.can_edit_home(home_id));

CREATE POLICY "Owners can delete equipment"
    ON public.equipment FOR DELETE
    USING (public.get_home_role(home_id) = 'owner');

-- ---- Equipment Photos ----
ALTER TABLE public.equipment_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view equipment photos"
    ON public.equipment_photos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.equipment e
            WHERE e.id = equipment_photos.equipment_id
            AND public.is_home_member(e.home_id)
        )
    );

CREATE POLICY "Contributors+ can add equipment photos"
    ON public.equipment_photos FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.equipment e
            WHERE e.id = equipment_photos.equipment_id
            AND public.can_edit_home(e.home_id)
        )
    );

CREATE POLICY "Contributors+ can delete equipment photos"
    ON public.equipment_photos FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.equipment e
            WHERE e.id = equipment_photos.equipment_id
            AND public.can_edit_home(e.home_id)
        )
    );

-- ---- Maintenance Tasks ----
ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view tasks"
    ON public.maintenance_tasks FOR SELECT
    USING (public.is_home_member(home_id));

CREATE POLICY "Contributors+ can create tasks"
    ON public.maintenance_tasks FOR INSERT
    WITH CHECK (public.can_edit_home(home_id));

CREATE POLICY "Contributors+ can update tasks"
    ON public.maintenance_tasks FOR UPDATE
    USING (public.can_edit_home(home_id));

CREATE POLICY "Contributors+ can delete tasks"
    ON public.maintenance_tasks FOR DELETE
    USING (public.can_edit_home(home_id));

-- ---- Task Completions ----
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view completions"
    ON public.task_completions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.maintenance_tasks t
            WHERE t.id = task_completions.task_id
            AND public.is_home_member(t.home_id)
        )
    );

CREATE POLICY "Contributors+ can add completions"
    ON public.task_completions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.maintenance_tasks t
            WHERE t.id = task_completions.task_id
            AND public.can_edit_home(t.home_id)
        )
    );

-- ---- Task Completion Photos ----
ALTER TABLE public.task_completion_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view completion photos"
    ON public.task_completion_photos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.task_completions tc
            JOIN public.maintenance_tasks t ON t.id = tc.task_id
            WHERE tc.id = task_completion_photos.completion_id
            AND public.is_home_member(t.home_id)
        )
    );

CREATE POLICY "Contributors+ can add completion photos"
    ON public.task_completion_photos FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.task_completions tc
            JOIN public.maintenance_tasks t ON t.id = tc.task_id
            WHERE tc.id = task_completion_photos.completion_id
            AND public.can_edit_home(t.home_id)
        )
    );

-- ---- Email Log ----
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email log"
    ON public.email_log FOR SELECT
    USING (user_id = auth.uid());
