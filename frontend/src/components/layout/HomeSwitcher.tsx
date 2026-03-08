import { useState } from 'react'
import { ChevronDown, Plus, Home } from 'lucide-react'
import { useHomeContext } from '@/contexts/HomeContext'
import { useHomes } from '@/hooks/useHomes'
import { cn } from '@/lib/utils'

export function HomeSwitcher() {
  const [open, setOpen] = useState(false)
  const { selectedHome, setSelectedHome } = useHomeContext()
  const { data: homes } = useHomes()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        <Home className="h-4 w-4 text-muted-foreground" />
        <span className="max-w-[180px] truncate">
          {selectedHome?.name || 'Select a home'}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-white py-1 shadow-lg">
            {homes?.map((home) => (
              <button
                key={home.id}
                onClick={() => {
                  setSelectedHome(home)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                  selectedHome?.id === home.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <Home className="h-4 w-4 shrink-0" />
                <div className="min-w-0 text-left">
                  <p className="truncate font-medium">{home.name}</p>
                  {home.city && home.state && (
                    <p className="truncate text-xs text-muted-foreground">
                      {home.city}, {home.state}
                    </p>
                  )}
                </div>
              </button>
            ))}

            {homes && homes.length > 0 && (
              <div className="my-1 border-t border-border" />
            )}

            <a
              href="/homes?action=new"
              className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <Plus className="h-4 w-4" />
              Add a new home
            </a>
          </div>
        </>
      )}
    </div>
  )
}
