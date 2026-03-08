import { useParams, useNavigate } from 'react-router-dom'
import { useEquipmentById } from '@/hooks/useEquipment'
import { format } from 'date-fns'
import { FREQUENCY_TYPES } from '@/lib/constants'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  AlertTriangle,
  Printer,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from 'lucide-react'

export function EquipmentDetailPage() {
  const { homeId, equipmentId } = useParams<{ homeId: string; equipmentId: string }>()
  const navigate = useNavigate()
  const { data: item, isLoading } = useEquipmentById(equipmentId)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Equipment not found.</p>
      </div>
    )
  }

  const tasks = (item as any).tasks || []
  const completions = tasks.flatMap((t: any) =>
    (t.completions || []).map((c: any) => ({ ...c, taskTitle: t.title }))
  ).sort((a: any, b: any) => new Date(b.completed_date).getTime() - new Date(a.completed_date).getTime())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/homes/${homeId}/equipment`)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Equipment
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-gray-50 no-print"
        >
          <Printer className="h-4 w-4" />
          Print Detail
        </button>
      </div>

      {/* Equipment Header */}
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{item.name}</h1>
            <p className="mt-1 text-muted-foreground">
              {item.manufacturer || 'Unknown manufacturer'}
              {item.model_number && ` · Model: ${item.model_number}`}
            </p>
          </div>
          {item.recall_status === 'recalled' && (
            <span className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700">
              <AlertTriangle className="h-4 w-4" />
              Recall Alert
            </span>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(item as any).category && (
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="text-sm font-medium">{(item as any).category.name}</p>
            </div>
          )}
          {item.serial_number && (
            <div>
              <p className="text-xs text-muted-foreground">Serial Number</p>
              <p className="text-sm font-medium font-mono">{item.serial_number}</p>
            </div>
          )}
          {item.location_in_home && (
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="flex items-center gap-1 text-sm font-medium">
                <MapPin className="h-3 w-3" />
                {item.location_in_home}
              </p>
            </div>
          )}
          {item.installed_date && (
            <div>
              <p className="text-xs text-muted-foreground">Installed</p>
              <p className="flex items-center gap-1 text-sm font-medium">
                <Calendar className="h-3 w-3" />
                {format(new Date(item.installed_date), 'MMM d, yyyy')}
              </p>
            </div>
          )}
          {item.manufacture_date && (
            <div>
              <p className="text-xs text-muted-foreground">Manufactured</p>
              <p className="text-sm font-medium">{format(new Date(item.manufacture_date), 'MMM d, yyyy')}</p>
            </div>
          )}
          {item.warranty_expiration && (
            <div>
              <p className="text-xs text-muted-foreground">Warranty Expires</p>
              <p className="text-sm font-medium">{format(new Date(item.warranty_expiration), 'MMM d, yyyy')}</p>
            </div>
          )}
          {item.manual_url && (
            <div>
              <p className="text-xs text-muted-foreground">Manual</p>
              <a
                href={item.manual_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                <FileText className="h-3 w-3" />
                View Manual
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {item.notes && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm">{item.notes}</p>
          </div>
        )}
      </div>

      {/* Maintenance Tasks */}
      <div className="rounded-xl border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">Maintenance Tasks</h2>
          <span className="text-sm text-muted-foreground">{tasks.length} tasks</span>
        </div>
        {tasks.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No maintenance tasks yet. AI recommendations will appear here after processing.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tasks.map((task: any) => (
              <div key={task.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{task.title}</p>
                    {task.source === 'ai_recommended' && (
                      <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700">AI</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {FREQUENCY_TYPES.find(f => f.value === task.frequency_type)?.label || task.frequency_type}
                    {task.next_due_date && ` · Due ${format(new Date(task.next_due_date), 'MMM d, yyyy')}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {task.completions?.length || 0} done
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Maintenance History */}
      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold">Maintenance History</h2>
        </div>
        {completions.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No maintenance has been completed yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {completions.map((comp: any) => (
              <div key={comp.id} className="flex items-start gap-3 px-5 py-3">
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{comp.taskTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(comp.completed_date), 'MMM d, yyyy')}
                    {comp.notes && ` · ${comp.notes}`}
                  </p>
                  {comp.cost && (
                    <p className="text-xs text-muted-foreground">Cost: ${comp.cost}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
