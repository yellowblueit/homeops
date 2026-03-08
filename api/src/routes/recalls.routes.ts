import { Router } from 'express'
import type { Response } from 'express'
import { checkRecalls } from '../services/recall.service.js'
import { logger } from '../utils/logger.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()

// POST /api/recalls/check
router.post('/check', async (req: AuthenticatedRequest, res: Response) => {
  const { equipment_id, manufacturer, model_number, product_description } = req.body

  if (!equipment_id || !manufacturer) {
    res.status(400).json({ error: 'equipment_id and manufacturer are required' })
    return
  }

  try {
    const result = await checkRecalls(
      equipment_id,
      manufacturer,
      model_number || '',
      product_description || manufacturer
    )
    res.json(result)
  } catch (error) {
    logger.error('Recall check failed', { error: (error as Error).message })
    res.status(500).json({ error: 'Failed to check recalls' })
  }
})

export default router
