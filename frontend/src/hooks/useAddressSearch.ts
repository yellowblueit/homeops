import { useState, useRef, useCallback } from 'react'

interface AddressSuggestion {
  display_name: string
  address: {
    house_number?: string
    road?: string
    city?: string
    town?: string
    village?: string
    state?: string
    postcode?: string
    country_code?: string
  }
  lat: string
  lon: string
}

export interface ParsedAddress {
  address_line1: string
  city: string
  state: string
  zip_code: string
  latitude: number
  longitude: number
  display_name: string
}

export function useAddressSearch() {
  const [suggestions, setSuggestions] = useState<ParsedAddress[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const search = useCallback((query: string) => {
    // Clear previous timer
    if (timerRef.current) clearTimeout(timerRef.current)
    if (abortRef.current) abortRef.current.abort()

    if (query.length < 4) {
      setSuggestions([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    // Debounce 400ms
    timerRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const params = new URLSearchParams({
          q: query,
          format: 'json',
          addressdetails: '1',
          countrycodes: 'us',
          limit: '5',
        })

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          {
            signal: controller.signal,
            headers: { 'User-Agent': 'HomeOps/1.0' },
          }
        )

        if (!res.ok) throw new Error('Search failed')

        const data: AddressSuggestion[] = await res.json()

        const parsed: ParsedAddress[] = data
          .filter(d => d.address.road) // Only street-level results
          .map(d => ({
            address_line1: [d.address.house_number, d.address.road]
              .filter(Boolean)
              .join(' '),
            city: d.address.city || d.address.town || d.address.village || '',
            state: d.address.state || '',
            zip_code: d.address.postcode || '',
            latitude: parseFloat(d.lat),
            longitude: parseFloat(d.lon),
            display_name: d.display_name,
          }))

        setSuggestions(parsed)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setSuggestions([])
        }
      } finally {
        setIsSearching(false)
      }
    }, 400)
  }, [])

  const clear = useCallback(() => {
    setSuggestions([])
    if (timerRef.current) clearTimeout(timerRef.current)
    if (abortRef.current) abortRef.current.abort()
  }, [])

  return { suggestions, isSearching, search, clear }
}
