import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useHomes, useCreateHome, useDeleteHome } from '@/hooks/useHomes'
import { useHomeContext } from '@/contexts/HomeContext'
import { Plus, Home, MapPin, Trash2, ChevronRight, Loader2 } from 'lucide-react'
import { HOME_TYPES } from '@/lib/constants'

export function HomesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: homes, isLoading } = useHomes()
  const { setSelectedHome } = useHomeContext()
  const createHome = useCreateHome()
  const deleteHome = useDeleteHome()

  const [showForm, setShowForm] = useState(searchParams.get('action') === 'new')
  const [formData, setFormData] = useState({
    name: '',
    address_line1: '',
    city: '',
    state: '',
    zip_code: '',
    home_type: '' as string,
    year_built: '',
    square_footage: '',
    bedrooms: '',
    bathrooms: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const home = await createHome.mutateAsync({
      name: formData.name,
      address_line1: formData.address_line1 || null,
      city: formData.city || null,
      state: formData.state || null,
      zip_code: formData.zip_code || null,
      home_type: formData.home_type || null,
      year_built: formData.year_built ? parseInt(formData.year_built) : null,
      square_footage: formData.square_footage ? parseInt(formData.square_footage) : null,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
    })
    setSelectedHome(home)
    setShowForm(false)
    setFormData({ name: '', address_line1: '', city: '', state: '', zip_code: '', home_type: '', year_built: '', square_footage: '', bedrooms: '', bathrooms: '' })
  }

  const handleDelete = async (homeId: string) => {
    if (!confirm('Are you sure you want to delete this home? All equipment and tasks will be deleted.')) return
    await deleteHome.mutateAsync(homeId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Homes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Home
        </button>
      </div>

      {/* Add Home Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Add a New Home</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Home Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Main House, Lake Cabin"
                  required
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address_line1}
                  onChange={e => setFormData(f => ({ ...f, address_line1: e.target.value }))}
                  placeholder="123 Main Street"
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData(f => ({ ...f, city: e.target.value }))}
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e => setFormData(f => ({ ...f, state: e.target.value }))}
                    maxLength={2}
                    className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={e => setFormData(f => ({ ...f, zip_code: e.target.value }))}
                    className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Home Type</label>
                <select
                  value={formData.home_type}
                  onChange={e => setFormData(f => ({ ...f, home_type: e.target.value }))}
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select type...</option>
                  {HOME_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                <input
                  type="number"
                  value={formData.year_built}
                  onChange={e => setFormData(f => ({ ...f, year_built: e.target.value }))}
                  min={1800}
                  max={2030}
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sq. Footage</label>
                <input
                  type="number"
                  value={formData.square_footage}
                  onChange={e => setFormData(f => ({ ...f, square_footage: e.target.value }))}
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beds</label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={e => setFormData(f => ({ ...f, bedrooms: e.target.value }))}
                    min={0}
                    className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Baths</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={e => setFormData(f => ({ ...f, bathrooms: e.target.value }))}
                    min={0}
                    step={0.5}
                    className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createHome.isPending}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {createHome.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Home
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Homes List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : homes?.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Home className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">No homes yet</h2>
          <p className="text-muted-foreground mb-6">Add your first home to start tracking maintenance.</p>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
          >
            Add Your First Home
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {homes?.map((home) => (
            <div
              key={home.id}
              className="group relative rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-md"
            >
              <button
                onClick={() => {
                  setSelectedHome(home)
                  navigate(`/homes/${home.id}`)
                }}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Home className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <h3 className="mt-3 font-semibold">{home.name}</h3>
                {(home.city || home.state) && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {[home.city, home.state].filter(Boolean).join(', ')}
                  </p>
                )}
                <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                  {home.bedrooms && <span>{home.bedrooms} bed</span>}
                  {home.bathrooms && <span>{home.bathrooms} bath</span>}
                  {home.square_footage && <span>{home.square_footage.toLocaleString()} sqft</span>}
                </div>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(home.id)
                }}
                className="absolute bottom-4 right-4 rounded-lg p-1.5 text-gray-400 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 transition-all"
                title="Delete home"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
