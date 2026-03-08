import { useState } from 'react'
import { useHomeContext } from '@/contexts/HomeContext'
import { useTasks, useCompleteTask } from '@/hooks/useTasks'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { TASK_STATUS_COLORS, FREQUENCY_TYPES, PRIORITY_LEVELS } from '@/lib/constants'
import {
  CheckCircle2,
  Filter,
  Loader2,
  ClipboardList,
  Printer,
} from 'lucide-react'

export function TasksPage() {
  const { selectedHome } = useHomeContext()
  const { data: tasks, isLoading } = useTasks(selectedHome?.id)
  const { user } = useAuth()
  const completeTask = useCompleteTask()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [completing, setCompleting] = useState<string | null>(null)

  const filteredTasks = tasks?.filter(t => {
    if (statusFilter === 'all') return true
    return t.status === statusFilter
  })

  const handleComplete = async (taskId: string) => {
    if (!user) return
    setCompleting(taskId)
    await completeTask.mutateAsync({
      task_id: taskId,
      completed_by: user.id,
    })
    setCompleting(null)
  }

  if (!selectedHome) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold">Select a home to view tasks</h2>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Maintenance Tasks</h1>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {['all', 'overdue', 'due_soon', 'upcoming'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              statusFilter === s
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-gray-600 hover:bg-gray-50'
            )}
          >
            {s === 'all' ? 'All' : s === 'due_soon' ? 'Due Soon' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredTasks?.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No tasks found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white divide-y divide-border">
          {filteredTasks?.map((task) => (
            <div key={task.id} className="flex items-center gap-4 px-5 py-4">
              <button
                onClick={() => handleComplete(task.id)}
                disabled={completing === task.id}
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  task.status === 'overdue'
                    ? 'border-red-300 hover:bg-red-50 hover:border-red-500'
                    : 'border-gray-300 hover:bg-green-50 hover:border-green-500'
                )}
                title="Mark as complete"
              >
                {completing === task.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-gray-400" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{task.title}</p>
                  <span className={cn(
                    'shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium',
                    TASK_STATUS_COLORS[task.status as keyof typeof TASK_STATUS_COLORS] || TASK_STATUS_COLORS.upcoming
                  )}>
                    {task.status === 'due_soon' ? 'Due Soon' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                  <span>{task.equipment_name}</span>
                  {task.category_name && <span>{task.category_name}</span>}
                  {task.next_due_date && (
                    <span>Due {format(new Date(task.next_due_date), 'MMM d, yyyy')}</span>
                  )}
                  <span className="capitalize">
                    {FREQUENCY_TYPES.find(f => f.value === task.frequency_type)?.label || task.frequency_type}
                  </span>
                </div>
              </div>

              <div className="hidden sm:block">
                <span className={cn(
                  'text-xs font-medium capitalize',
                  PRIORITY_LEVELS.find(p => p.value === task.priority)?.color || 'text-gray-600'
                )}>
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
