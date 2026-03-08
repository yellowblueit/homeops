import { useMemo, useState, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, type Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import { useHomeContext } from '@/contexts/HomeContext'
import { useTasks } from '@/hooks/useTasks'
import { cn } from '@/lib/utils'
import { List, CalendarDays, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { TASK_STATUS_COLORS } from '@/lib/constants'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = { 'en-US': enUS }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
})

interface CalendarTask extends Event {
  id: string
  status: string
  equipmentName: string
  priority: string
}

export function CalendarPage() {
  const { selectedHome } = useHomeContext()
  const { data: tasks, isLoading } = useTasks(selectedHome?.id)
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month')
  const [date, setDate] = useState(new Date())

  const events: CalendarTask[] = useMemo(() => {
    if (!tasks) return []
    return tasks
      .filter(t => t.next_due_date)
      .map(t => ({
        id: t.id,
        title: t.title,
        start: new Date(t.next_due_date!),
        end: new Date(t.next_due_date!),
        allDay: true,
        status: t.status,
        equipmentName: t.equipment_name,
        priority: t.priority,
      }))
  }, [tasks])

  const eventStyleGetter = useCallback((event: CalendarTask) => {
    const colors: Record<string, { bg: string; border: string }> = {
      overdue: { bg: '#fef2f2', border: '#dc2626' },
      due_soon: { bg: '#fffbeb', border: '#f59e0b' },
      upcoming: { bg: '#eff6ff', border: '#3b82f6' },
    }
    const c = colors[event.status] || colors.upcoming
    return {
      style: {
        backgroundColor: c.bg,
        borderLeft: `3px solid ${c.border}`,
        color: '#1f2937',
        fontSize: '0.75rem',
        padding: '2px 4px',
        borderRadius: '4px',
      },
    }
  }, [])

  if (!selectedHome) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold">Select a home to view the calendar</h2>
        <p className="text-muted-foreground">Use the home switcher in the header.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border">
            <button
              onClick={() => setView('calendar')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors',
                view === 'calendar' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
              )}
              style={view === 'calendar' ? { borderRadius: '0.45rem 0 0 0.45rem' } : { borderRadius: '0.45rem 0 0 0.45rem' }}
            >
              <CalendarDays className="h-4 w-4" />
              Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors',
                view === 'list' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
              )}
              style={view === 'list' ? { borderRadius: '0 0.45rem 0.45rem 0' } : { borderRadius: '0 0.45rem 0.45rem 0' }}
            >
              <List className="h-4 w-4" />
              List
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : view === 'calendar' ? (
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const d = new Date(date)
                  d.setMonth(d.getMonth() - 1)
                  setDate(d)
                }}
                className="rounded-lg p-1.5 hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold">{format(date, 'MMMM yyyy')}</h2>
              <button
                onClick={() => {
                  const d = new Date(date)
                  d.setMonth(d.getMonth() + 1)
                  setDate(d)
                }}
                className="rounded-lg p-1.5 hover:bg-gray-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setDate(new Date())}
                className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Today
              </button>
              <button
                onClick={() => setCalendarView('month')}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm',
                  calendarView === 'month' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
                )}
              >
                Month
              </button>
              <button
                onClick={() => setCalendarView('week')}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm',
                  calendarView === 'week' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
                )}
              >
                Week
              </button>
            </div>
          </div>
          <div style={{ height: 600 }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={calendarView}
              date={date}
              onNavigate={setDate}
              onView={(v) => setCalendarView(v as 'month' | 'week')}
              eventPropGetter={eventStyleGetter}
              toolbar={false}
              popup
            />
          </div>
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl border border-border bg-white">
          <div className="divide-y divide-border">
            {tasks?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No maintenance tasks scheduled. Add equipment and tasks to see them here.
              </div>
            ) : (
              tasks?.map((task) => (
                <div key={task.id} className="flex items-center justify-between px-5 py-4">
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
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {task.equipment_name}
                      {task.category_name && ` · ${task.category_name}`}
                      {task.next_due_date && ` · Due ${format(new Date(task.next_due_date), 'MMM d, yyyy')}`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Print-friendly task list */}
      <div className="no-print flex justify-end">
        <button
          onClick={() => window.print()}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Print Task List
        </button>
      </div>
    </div>
  )
}
