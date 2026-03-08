-- Create maintenance tasks table
CREATE TABLE public.maintenance_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    home_id UUID NOT NULL REFERENCES public.homes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    frequency_type TEXT NOT NULL CHECK (frequency_type IN (
        'once', 'daily', 'weekly', 'biweekly', 'monthly',
        'quarterly', 'semi_annual', 'annual', 'custom'
    )),
    frequency_interval_days INTEGER,
    next_due_date DATE,
    last_completed_date DATE,
    source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'ai_recommended', 'manufacturer')),
    ai_confidence NUMERIC(3,2),
    user_overridden BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    estimated_duration_minutes INTEGER,
    estimated_cost NUMERIC(10,2),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_tasks_equipment ON public.maintenance_tasks(equipment_id);
CREATE INDEX idx_tasks_home ON public.maintenance_tasks(home_id);
CREATE INDEX idx_tasks_next_due ON public.maintenance_tasks(next_due_date) WHERE is_active = true;

CREATE TRIGGER tasks_updated_at
    BEFORE UPDATE ON public.maintenance_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Create task completions table
CREATE TABLE public.task_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.maintenance_tasks(id) ON DELETE CASCADE,
    completed_by UUID NOT NULL REFERENCES auth.users(id),
    completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    cost NUMERIC(10,2),
    duration_minutes INTEGER,
    professional_service BOOLEAN DEFAULT false,
    service_provider TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_completions_task ON public.task_completions(task_id);
CREATE INDEX idx_completions_date ON public.task_completions(completed_date);

-- Create task completion photos table
CREATE TABLE public.task_completion_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    completion_id UUID NOT NULL REFERENCES public.task_completions(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Auto-advance task schedule on completion
CREATE OR REPLACE FUNCTION public.advance_task_schedule()
RETURNS TRIGGER AS $$
DECLARE
    task_record RECORD;
    new_due DATE;
BEGIN
    SELECT * INTO task_record FROM public.maintenance_tasks WHERE id = NEW.task_id;

    IF task_record.frequency_type = 'once' THEN
        UPDATE public.maintenance_tasks
        SET is_active = false, last_completed_date = NEW.completed_date, updated_at = now()
        WHERE id = NEW.task_id;
    ELSE
        new_due := CASE task_record.frequency_type
            WHEN 'daily' THEN NEW.completed_date + INTERVAL '1 day'
            WHEN 'weekly' THEN NEW.completed_date + INTERVAL '1 week'
            WHEN 'biweekly' THEN NEW.completed_date + INTERVAL '2 weeks'
            WHEN 'monthly' THEN NEW.completed_date + INTERVAL '1 month'
            WHEN 'quarterly' THEN NEW.completed_date + INTERVAL '3 months'
            WHEN 'semi_annual' THEN NEW.completed_date + INTERVAL '6 months'
            WHEN 'annual' THEN NEW.completed_date + INTERVAL '1 year'
            WHEN 'custom' THEN NEW.completed_date + (task_record.frequency_interval_days || ' days')::INTERVAL
        END;

        UPDATE public.maintenance_tasks
        SET next_due_date = new_due, last_completed_date = NEW.completed_date, updated_at = now()
        WHERE id = NEW.task_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_task_completed
    AFTER INSERT ON public.task_completions
    FOR EACH ROW
    EXECUTE FUNCTION public.advance_task_schedule();
