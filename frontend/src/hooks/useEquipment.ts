import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Equipment, EquipmentCategory } from '@/types/database'

interface CreateEquipmentInput {
  home_id: string
  name: string
  category_id?: string | null
  manufacturer?: string | null
  model_number?: string | null
  serial_number?: string | null
  manufacture_date?: string | null
  installed_date?: string | null
  warranty_expiration?: string | null
  warranty_details?: string | null
  location_in_home?: string | null
  description?: string | null
  notes?: string | null
}

export function useEquipment(homeId: string | undefined) {
  return useQuery({
    queryKey: ['equipment', homeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select(`*, category:equipment_categories(*), photos:equipment_photos(*)`)
        .eq('home_id', homeId!)
        .eq('status', 'active')
        .order('name')
      if (error) throw error
      return data as unknown as (Equipment & { category: EquipmentCategory | null; photos: unknown[] })[]
    },
    enabled: !!homeId,
  })
}

export function useEquipmentById(equipmentId: string | undefined) {
  return useQuery({
    queryKey: ['equipment', 'detail', equipmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select(`*, category:equipment_categories(*), photos:equipment_photos(*), tasks:maintenance_tasks(*, completions:task_completions(*))`)
        .eq('id', equipmentId!)
        .single()
      if (error) throw error
      return data as unknown as Equipment & { category: EquipmentCategory | null; photos: unknown[]; tasks: unknown[] }
    },
    enabled: !!equipmentId,
  })
}

export function useCreateEquipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (equipment: CreateEquipmentInput) => {
      const { data, error } = await supabase
        .from('equipment')
        .insert(equipment as unknown as Record<string, unknown>)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Equipment
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['equipment', data.home_id] })
    },
  })
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CreateEquipmentInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('equipment')
        .update(updates as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Equipment
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['equipment', data.home_id] })
      queryClient.invalidateQueries({ queryKey: ['equipment', 'detail', data.id] })
    },
  })
}

export function useEquipmentCategories() {
  return useQuery({
    queryKey: ['equipment-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_categories')
        .select('*')
        .order('display_order')
      if (error) throw error
      return data as unknown as EquipmentCategory[]
    },
    staleTime: Infinity,
  })
}
