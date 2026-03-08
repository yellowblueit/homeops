import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { HomeDashboardSummary } from '@/types/database'

export function useDashboardSummary(homeId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard', homeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_dashboard_summary')
        .select('*')
        .eq('home_id', homeId!)
        .single()
      if (error) throw error
      return data as unknown as HomeDashboardSummary
    },
    enabled: !!homeId,
  })
}

export function useAllDashboardSummaries(homeIds: string[] | undefined) {
  return useQuery({
    queryKey: ['dashboard', 'all', homeIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_dashboard_summary')
        .select('*')
        .in('home_id', homeIds!)
      if (error) throw error
      return data as unknown as HomeDashboardSummary[]
    },
    enabled: !!homeIds && homeIds.length > 0,
  })
}
