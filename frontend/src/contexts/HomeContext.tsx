import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Home } from '@/types/database'

interface HomeContextType {
  selectedHome: Home | null
  setSelectedHome: (home: Home | null) => void
}

const HomeContext = createContext<HomeContextType | undefined>(undefined)

const STORAGE_KEY = 'homemaint_selected_home_id'

export function HomeProvider({ children }: { children: ReactNode }) {
  const [selectedHome, setSelectedHomeState] = useState<Home | null>(null)

  const setSelectedHome = (home: Home | null) => {
    setSelectedHomeState(home)
    if (home) {
      localStorage.setItem(STORAGE_KEY, home.id)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // Expose stored home ID for hooks to use on initial load
  useEffect(() => {
    // The stored home ID is read by useHomes hook to auto-select
  }, [])

  return (
    <HomeContext.Provider value={{ selectedHome, setSelectedHome }}>
      {children}
    </HomeContext.Provider>
  )
}

export function useHomeContext() {
  const context = useContext(HomeContext)
  if (context === undefined) {
    throw new Error('useHomeContext must be used within a HomeProvider')
  }
  return context
}

export function getStoredHomeId(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}
