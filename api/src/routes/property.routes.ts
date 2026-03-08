import { Router } from 'express'
import type { Response } from 'express'
import { logger } from '../utils/logger.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()

// POST /api/property/lookup
// Note: Full implementation requires a property data API subscription (Attom, RealtyMole, etc.)
// This provides a placeholder structure that returns what it can from free sources
router.post('/lookup', async (req: AuthenticatedRequest, res: Response) => {
  const { address, city, state, zip_code } = req.body

  if (!address || !city || !state) {
    res.status(400).json({ error: 'address, city, and state are required' })
    return
  }

  try {
    // Placeholder: In production, integrate with property data API
    // Options: Attom Data, RealtyMole, or county assessor APIs
    const fullAddress = `${address}, ${city}, ${state} ${zip_code || ''}`

    // For now, return a structure that the frontend can use
    // When a property API is configured, this would be populated
    res.json({
      address: fullAddress,
      year_built: null,
      square_footage: null,
      lot_size_sqft: null,
      home_type: null,
      stories: null,
      bedrooms: null,
      bathrooms: null,
      roof_type: null,
      exterior_type: null,
      heating_type: null,
      cooling_type: null,
      aerial_image_url: null,
      data_source: 'none',
      message: 'Property data API not configured. Add PROPERTY_API_KEY to .env to enable auto-population.',
    })
  } catch (error) {
    logger.error('Property lookup failed', { error: (error as Error).message })
    res.status(500).json({ error: 'Failed to lookup property' })
  }
})

export default router
