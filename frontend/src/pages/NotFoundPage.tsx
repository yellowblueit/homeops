import { useNavigate } from 'react-router-dom'
import { Home } from 'lucide-react'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <p className="mt-2 text-lg text-muted-foreground">Page not found</p>
      <button
        onClick={() => navigate('/')}
        className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
      >
        <Home className="h-4 w-4" />
        Go Home
      </button>
    </div>
  )
}
