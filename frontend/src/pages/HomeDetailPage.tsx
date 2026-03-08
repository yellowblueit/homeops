import { useParams, useNavigate } from 'react-router-dom'
import { useHomes } from '@/hooks/useHomes'
import { useEquipment } from '@/hooks/useEquipment'
import { useDashboardSummary } from '@/hooks/useDashboard'
import {
  MapPin,
  Home,
  Plus,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Loader2,
} from 'lucide-react'

export function HomeDetailPage() {
  const { homeId } = useParams<{ homeId: string }>()
  const navigate = useNavigate()
  const { data: homes } = useHomes()
  const { data: equipment, isLoading: equipmentLoading } = useEquipment(homeId)
  const { data: summary } = useDashboardSummary(homeId)

  const home = homes?.find(h => h.id === homeId)

  if (!home) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/homes')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Homes
      </button>

      {/* Home Header */}
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{home.name}</h1>
            {(home.address_line1 || home.city) && (
              <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {[home.address_line1, home.city, home.state, home.zip_code]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Home className="h-6 w-6" />
          </div>
        </div>

        {/* Property Details */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {home.home_type && (
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="text-sm font-medium capitalize">{home.home_type.replace('_', ' ')}</p>
            </div>
          )}
          {home.year_built && (
            <div>
              <p className="text-xs text-muted-foreground">Year Built</p>
              <p className="text-sm font-medium">{home.year_built}</p>
            </div>
          )}
          {home.square_footage && (
            <div>
              <p className="text-xs text-muted-foreground">Sq Ft</p>
              <p className="text-sm font-medium">{home.square_footage.toLocaleString()}</p>
            </div>
          )}
          {home.bedrooms && (
            <div>
              <p className="text-xs text-muted-foreground">Bedrooms</p>
              <p className="text-sm font-medium">{home.bedrooms}</p>
            </div>
          )}
          {home.bathrooms && (
            <div>
              <p className="text-xs text-muted-foreground">Bathrooms</p>
              <p className="text-sm font-medium">{home.bathrooms}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {summary && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Equipment</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{summary.equipment_count}</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-muted-foreground">Overdue</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{summary.overdue_count}</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-muted-foreground">Due Soon</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{summary.due_soon_count}</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Done (30d)</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{summary.completed_last_30_days}</p>
          </div>
        </div>
      )}

      {/* Equipment Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Equipment</h2>
          <button
            onClick={() => navigate(`/homes/${homeId}/equipment`)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Manage Equipment
          </button>
        </div>

        {equipmentLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : equipment?.length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-8 text-center">
            <Wrench className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No equipment added yet.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {equipment?.slice(0, 6).map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/homes/${homeId}/equipment/${item.id}`)}
                className="rounded-xl border border-border bg-white p-4 text-left transition-shadow hover:shadow-md"
              >
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.manufacturer && `${item.manufacturer} · `}
                  {(item as any).category?.name || 'Uncategorized'}
                </p>
                {item.location_in_home && (
                  <p className="mt-1 text-xs text-muted-foreground">{item.location_in_home}</p>
                )}
                {item.recall_status === 'recalled' && (
                  <span className="mt-2 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    Recall Alert
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
