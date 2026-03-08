import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useHomeContext, getStoredHomeId } from '@/contexts/HomeContext'
import { useEffect } from 'react'
import type { Home } from '@/types/database'

interface CreateHomeInput {
  name: string
  address_line1?: string | null
  address_line2?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  country?: string
  home_type?: string | null
  year_built?: number | null
  square_footage?: number | null
  lot_size_sqft?: number | null
  stories?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  garage_type?: string | null
  garage_spaces?: number
  notes?: string | null
}

export function useHomes() {
  const { user } = useAuth()
  const { selectedHome, setSelectedHome } = useHomeContext()

  const query = useQuery({
    queryKey: ['homes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homes')
        .select(`*, home_members!inner(role)`)
        .order('name')
      if (error) throw error
      return data as unknown as Home[]
    },
    enabled: !!user,
  })

  useEffect(() => {
    if (query.data && query.data.length > 0 && !selectedHome) {
      const storedId = getStoredHomeId()
      const stored = storedId ? query.data.find((h: Home) => h.id === storedId) : null
      setSelectedHome(stored || query.data[0])
    }
  }, [query.data, selectedHome, setSelectedHome])

  return query
}

export function useCreateHome() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (home: CreateHomeInput) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('homes')
        .insert({ ...home, owner_id: user.id } as Record<string, unknown>)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Home
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homes'] })
    },
  })
}

export function useUpdateHome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CreateHomeInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('homes')
        .update(updates as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Home
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homes'] })
    },
  })
}

export function useDeleteHome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (homeId: string) => {
      const { error } = await supabase
        .from('homes')
        .delete()
        .eq('id', homeId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homes'] })
    },
  })
}
