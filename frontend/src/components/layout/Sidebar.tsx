import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Home,
  ClipboardList,
  Users,
  Settings,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calendar', icon: Calendar, label: 'Calendar', highlight: true },
  { to: '/homes', icon: Home, label: 'My Homes' },
  { to: '/tasks', icon: ClipboardList, label: 'Tasks' },
  { to: '/members', icon: Users, label: 'Members' },
]

const bottomItems = [
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-border lg:bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
          <Wrench className="h-4 w-4" />
        </div>
        <span className="text-lg font-semibold">HomeMaint</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col justify-between p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    item.highlight && !isActive && 'font-semibold'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {item.highlight && (
                  <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    Main
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <ul className="space-y-1">
          {bottomItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
