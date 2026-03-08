import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { TaskWithStatus, MaintenanceTask } from '@/types/database'

interface CreateTaskInput {
  equipment_id: string
  home_id: string
  title: string
  description?: string | null
  frequency_type: string
  frequency_interval_days?: number | null
  next_due_date?: string | null
  source?: 'manual' | 'ai_recommended' | 'manufacturer'
  ai_confidence?: number | null
  priority?: 'low' | 'medium' | 'high' | 'critical'
  estimated_duration_minutes?: number | null
  estimated_cost?: number | null
}

interface CreateCompletionInput {
  task_id: string
  completed_by: string
  completed_date?: string
  notes?: string | null
  cost?: number | null
  duration_minutes?: number | null
  professional_service?: boolean
  service_provider?: string | null
}

export function useTasks(homeId: string | undefined) {
  return useQuery({
    queryKey: ['tasks', homeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks_with_status')
        .select('*')
        .eq('home_id', homeId!)
        .eq('is_active', true)
        .order('next_due_date', { ascending: true, nullsFirst: false })
      if (error) throw error
      return data as unknown as TaskWithStatus[]
    },
    enabled: !!homeId,
  })
}

export function useAllTasks(homeIds: string[] | undefined) {
  return useQuery({
    queryKey: ['tasks', 'all', homeIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks_with_status')
        .select('*')
        .in('home_id', homeIds!)
        .eq('is_active', true)
        .order('next_due_date', { ascending: true, nullsFirst: false })
      if (error) throw error
      return data as unknown as TaskWithStatus[]
    },
    enabled: !!homeIds && homeIds.length > 0,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (task: CreateTaskInput) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .insert({ ...task, created_by: user.id } as Record<string, unknown>)
        .select()
        .single()
      if (error) throw error
      return data as unknown as MaintenanceTask
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data.home_id] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['equipment', 'detail', data.equipment_id] })
    },
  })
}

export function useCompleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (completion: CreateCompletionInput) => {
      const { data, error } = await supabase
        .from('task_completions')
        .insert(completion as unknown as Record<string, unknown>)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CreateTaskInput>) => {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .update(updates as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as unknown as MaintenanceTask
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data.home_id] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'all'] })
    },
  })
}
