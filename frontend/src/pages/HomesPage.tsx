import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useHomes, useCreateHome, useDeleteHome } from '@/hooks/useHomes'
import { useHomeContext } from '@/contexts/HomeContext'
import { useAddressSearch, type ParsedAddress } from '@/hooks/useAddressSearch'
import { Plus, Home, MapPin, Trash2, ChevronRight, Loader2, Search } from 'lucide-react'
import { HOME_TYPES } from '@/lib/constants'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

// Map full state names to abbreviations
const STATE_ABBREVS: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
  'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
  'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC',
}

function abbrevState(state: string): string {
  if (state.length === 2) return state.toUpperCase()
  return STATE_ABBREVS[state] || state
}

export function HomesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: homes, isLoading } = useHomes()
  const { setSelectedHome } = useHomeContext()
  const createHome = useCreateHome()
  const deleteHome = useDeleteHome()
  const { suggestions, isSearching, search, clear } = useAddressSearch()

  const [showForm, setShowForm] = useState(searchParams.get('action') === 'new')
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const addressInputRef = useRef<HTMLInputElement>(null)

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

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          addressInputRef.current && !addressInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleAddressChange = (value: string) => {
    setFormData(f => ({ ...f, address_line1: value }))
    search(value)
    setShowSuggestions(true)
  }

  const selectAddress = (addr: ParsedAddress) => {
    setFormData(f => ({
      ...f,
      address_line1: addr.address_line1,
      city: addr.city,
      state: abbrevState(addr.state),
      zip_code: addr.zip_code,
    }))
    setShowSuggestions(false)
    clear()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create home'
      setError(msg)
    }
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
          onClick={() => { setShowForm(true); setError(null) }}
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

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

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

              {/* Address with autocomplete */}
              <div className="sm:col-span-2 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                  {isSearching && <Loader2 className="ml-1 inline h-3 w-3 animate-spin" />}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={addressInputRef}
                    type="text"
                    value={formData.address_line1}
                    onChange={e => handleAddressChange(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Start typing an address..."
                    className="w-full rounded-lg border border-input pl-9 pr-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-white shadow-lg"
                  >
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectAddress(s)}
                        className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                        <div>
                          <div className="font-medium">{s.address_line1}</div>
                          <div className="text-xs text-gray-500">
                            {[s.city, s.state, s.zip_code].filter(Boolean).join(', ')}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
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
                  <select
                    value={formData.state}
                    onChange={e => setFormData(f => ({ ...f, state: e.target.value }))}
                    className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="">--</option>
                    {US_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
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
