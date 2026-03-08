-- View: tasks with computed status
CREATE OR REPLACE VIEW public.tasks_with_status AS
SELECT
    t.*,
    e.name AS equipment_name,
    e.manufacturer AS equipment_manufacturer,
    e.location_in_home,
    ec.name AS category_name,
    ec.slug AS category_slug,
    ec.icon AS category_icon,
    CASE
        WHEN t.is_active = false THEN 'inactive'
        WHEN t.next_due_date < CURRENT_DATE THEN 'overdue'
        WHEN t.next_due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
        ELSE 'upcoming'
    END AS status,
    (SELECT COUNT(*) FROM public.task_completions tc WHERE tc.task_id = t.id) AS completion_count,
    (SELECT MAX(tc.completed_date) FROM public.task_completions tc WHERE tc.task_id = t.id) AS latest_completion
FROM public.maintenance_tasks t
JOIN public.equipment e ON t.equipment_id = e.id
LEFT JOIN public.equipment_categories ec ON e.category_id = ec.id;

-- View: dashboard summary per home
CREATE OR REPLACE VIEW public.home_dashboard_summary AS
SELECT
    h.id AS home_id,
    h.name AS home_name,
    COUNT(DISTINCT e.id) AS equipment_count,
    COUNT(DISTINCT t.id) FILTER (WHERE t.is_active) AS active_task_count,
    COUNT(DISTINCT t.id) FILTER (WHERE t.is_active AND t.next_due_date < CURRENT_DATE) AS overdue_count,
    COUNT(DISTINCT t.id) FILTER (WHERE t.is_active AND t.next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 7) AS due_soon_count,
    COUNT(DISTINCT tc.id) FILTER (WHERE tc.completed_date >= CURRENT_DATE - INTERVAL '30 days') AS completed_last_30_days
FROM public.homes h
LEFT JOIN public.equipment e ON e.home_id = h.id AND e.status = 'active'
LEFT JOIN public.maintenance_tasks t ON t.home_id = h.id
LEFT JOIN public.task_completions tc ON tc.task_id = t.id
GROUP BY h.id, h.name;
