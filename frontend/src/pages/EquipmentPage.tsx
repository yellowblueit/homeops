import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEquipment, useCreateEquipment, useEquipmentCategories } from '@/hooks/useEquipment'
import {
  Plus,
  Search,
  Wrench,
  ArrowLeft,
  AlertTriangle,
  Loader2,
  Camera,
} from 'lucide-react'

export function EquipmentPage() {
  const { homeId } = useParams<{ homeId: string }>()
  const navigate = useNavigate()
  const { data: equipment, isLoading } = useEquipment(homeId)
  const { data: categories } = useEquipmentCategories()
  const createEquipment = useCreateEquipment()

  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const [formData, setFormData] = useState({
    name: '',
    manufacturer: '',
    model_number: '',
    serial_number: '',
    category_id: '',
    location_in_home: '',
    installed_date: '',
    warranty_expiration: '',
  })

  const filteredEquipment = equipment?.filter(item => {
    const matchesSearch = !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.manufacturer?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category_id === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!homeId) return
    const data = await createEquipment.mutateAsync({
      home_id: homeId,
      name: formData.name,
      manufacturer: formData.manufacturer || null,
      model_number: formData.model_number || null,
      serial_number: formData.serial_number || null,
      category_id: formData.category_id || null,
      location_in_home: formData.location_in_home || null,
      installed_date: formData.installed_date || null,
      warranty_expiration: formData.warranty_expiration || null,
    })
    setShowForm(false)
    setFormData({ name: '', manufacturer: '', model_number: '', serial_number: '', category_id: '', location_in_home: '', installed_date: '', warranty_expiration: '' })
    navigate(`/homes/${homeId}/equipment/${data.id}`)
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(`/homes/${homeId}`)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Equipment</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Equipment
        </button>
      </div>

      {/* Add Equipment Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Add Equipment</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Samsung Washing Machine"
                  required
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category_id}
                  onChange={e => setFormData(f => ({ ...f, category_id: e.target.value }))}
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select category...</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={e => setFormData(f => ({ ...f, manufacturer: e.target.value }))}
                  placeholder="e.g., Samsung, GE, Carrier"
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Number</label>
                <input
                  type="text"
                  value={formData.model_number}
                  onChange={e => setFormData(f => ({ ...f, model_number: e.target.value }))}
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                <input
                  type="text"
                  value={formData.serial_number}
                  onChange={e => setFormData(f => ({ ...f, serial_number: e.target.value }))}
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location in Home</label>
                <input
                  type="text"
                  value={formData.location_in_home}
                  onChange={e => setFormData(f => ({ ...f, location_in_home: e.target.value }))}
                  placeholder="e.g., Basement, Kitchen, Garage"
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Installed Date</label>
                <input
                  type="date"
                  value={formData.installed_date}
                  onChange={e => setFormData(f => ({ ...f, installed_date: e.target.value }))}
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiration</label>
                <input
                  type="date"
                  value={formData.warranty_expiration}
                  onChange={e => setFormData(f => ({ ...f, warranty_expiration: e.target.value }))}
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createEquipment.isPending}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {createEquipment.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Add Equipment
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

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search equipment..."
            className="w-full rounded-lg border border-input bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="all">All Categories</option>
          {categories?.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Equipment Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredEquipment?.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center">
          <Wrench className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {search || categoryFilter !== 'all'
              ? 'No equipment matches your filters.'
              : 'No equipment added yet. Click "Add Equipment" to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEquipment?.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/homes/${homeId}/equipment/${item.id}`)}
              className="group rounded-xl border border-border bg-white p-5 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Wrench className="h-5 w-5" />
                </div>
                {item.recall_status === 'recalled' && (
                  <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    <AlertTriangle className="h-3 w-3" />
                    Recall
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-semibold">{item.name}</h3>
              <p className="text-sm text-muted-foreground">
                {item.manufacturer || 'Unknown manufacturer'}
                {item.model_number && ` · ${item.model_number}`}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                {(item as any).category && (
                  <span className="rounded bg-gray-100 px-1.5 py-0.5">{(item as any).category.name}</span>
                )}
                {item.location_in_home && (
                  <span>{item.location_in_home}</span>
                )}
              </div>
              {(item as any).photos?.length > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Camera className="h-3 w-3" />
                  {(item as any).photos.length} photo{(item as any).photos.length !== 1 ? 's' : ''}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
