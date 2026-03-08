import { useHomeContext } from '@/contexts/HomeContext'
import { useDashboardSummary } from '@/hooks/useDashboard'
import { useTasks } from '@/hooks/useTasks'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  ArrowRight,
  CalendarDays,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { TASK_STATUS_COLORS } from '@/lib/constants'

export function DashboardPage() {
  const navigate = useNavigate()
  const { selectedHome } = useHomeContext()
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary(selectedHome?.id)
  const { data: tasks, isLoading: tasksLoading } = useTasks(selectedHome?.id)

  if (!selectedHome) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Welcome to Home Maintenance</h2>
        <p className="text-muted-foreground mb-6">Get started by adding your first home.</p>
        <button
          onClick={() => navigate('/homes?action=new')}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
        >
          Add Your First Home
        </button>
      </div>
    )
  }

  const overdueTasks = tasks?.filter(t => t.status === 'overdue') || []
  const dueSoonTasks = tasks?.filter(t => t.status === 'due_soon') || []

  const statCards = [
    {
      label: 'Overdue',
      value: summary?.overdue_count ?? 0,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      label: 'Due This Week',
      value: summary?.due_soon_count ?? 0,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-50',
      iconColor: 'text-yellow-600',
    },
    {
      label: 'Completed (30d)',
      value: summary?.completed_last_30_days ?? 0,
      icon: CheckCircle2,
      color: 'text-green-600 bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      label: 'Equipment',
      value: summary?.equipment_count ?? 0,
      icon: Wrench,
      color: 'text-blue-600 bg-blue-50',
      iconColor: 'text-blue-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">{selectedHome.name}</p>
        </div>
        <button
          onClick={() => navigate('/calendar')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <CalendarDays className="h-4 w-4" />
          View Calendar
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
              <div className={cn('rounded-lg p-2', card.color)}>
                <card.icon className={cn('h-4 w-4', card.iconColor)} />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold">{summaryLoading ? '-' : card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Overdue Tasks */}
        <div className="rounded-xl border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold text-red-600">Overdue Tasks</h2>
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
              {overdueTasks.length}
            </span>
          </div>
          <div className="divide-y divide-border">
            {tasksLoading ? (
              <div className="p-5 text-center text-muted-foreground">Loading...</div>
            ) : overdueTasks.length === 0 ? (
              <div className="p-5 text-center text-muted-foreground">
                No overdue tasks. Great job!
              </div>
            ) : (
              overdueTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.equipment_name} &middot; Due {task.next_due_date ? format(new Date(task.next_due_date), 'MMM d') : 'N/A'}
                    </p>
                  </div>
                  <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium', TASK_STATUS_COLORS.overdue)}>
                    Overdue
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Due Soon */}
        <div className="rounded-xl border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold text-yellow-600">Due This Week</h2>
            <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
              {dueSoonTasks.length}
            </span>
          </div>
          <div className="divide-y divide-border">
            {tasksLoading ? (
              <div className="p-5 text-center text-muted-foreground">Loading...</div>
            ) : dueSoonTasks.length === 0 ? (
              <div className="p-5 text-center text-muted-foreground">
                Nothing due this week.
              </div>
            ) : (
              dueSoonTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.equipment_name} &middot; Due {task.next_due_date ? format(new Date(task.next_due_date), 'MMM d') : 'N/A'}
                    </p>
                  </div>
                  <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium', TASK_STATUS_COLORS.due_soon)}>
                    Due Soon
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-white p-5">
        <h2 className="mb-4 font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            onClick={() => navigate(`/homes/${selectedHome.id}/equipment`)}
            className="flex items-center justify-between rounded-lg border border-border p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="font-medium">View Equipment</p>
              <p className="text-sm text-muted-foreground">Manage your appliances</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center justify-between rounded-lg border border-border p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="font-medium">All Tasks</p>
              <p className="text-sm text-muted-foreground">View maintenance tasks</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate('/calendar')}
            className="flex items-center justify-between rounded-lg border border-border p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="font-medium">Calendar</p>
              <p className="text-sm text-muted-foreground">See your schedule</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}
