import { Router } from 'express'
import type { Response } from 'express'
import { getMaintenanceRecommendations, extractManualInfo } from '../services/claude.service.js'
import { supabaseAdmin } from '../utils/supabase.js'
import { logger } from '../utils/logger.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()

// POST /api/ai/maintenance-recommendations
router.post('/maintenance-recommendations', async (req: AuthenticatedRequest, res: Response) => {
  const { equipment_id, manufacturer, model_number, category, installed_date, year_built } = req.body

  if (!equipment_id || !manufacturer || !category) {
    res.status(400).json({ error: 'equipment_id, manufacturer, and category are required' })
    return
  }

  try {
    const recommendations = await getMaintenanceRecommendations({
      manufacturer,
      model_number: model_number || '',
      category,
      installed_date,
      home_year_built: year_built,
    })

    // Store suggestions in equipment record
    await supabaseAdmin
      .from('equipment')
      .update({ ai_maintenance_suggestions: recommendations as any })
      .eq('id', equipment_id)

    res.json({ recommendations })
  } catch (error) {
    logger.error('Maintenance recommendations failed', { error: (error as Error).message })
    res.status(500).json({ error: 'Failed to generate recommendations' })
  }
})

// POST /api/ai/manual-lookup
router.post('/manual-lookup', async (req: AuthenticatedRequest, res: Response) => {
  const { equipment_id, manufacturer, model_number, category } = req.body

  if (!equipment_id || !manufacturer) {
    res.status(400).json({ error: 'equipment_id and manufacturer are required' })
    return
  }

  try {
    // For now, use Claude to generate maintenance info based on knowledge
    // In production, add web scraping for actual manuals
    const result = await extractManualInfo(
      manufacturer,
      model_number || '',
      `${manufacturer} ${model_number || ''} ${category || ''} maintenance manual information`
    )

    await supabaseAdmin
      .from('equipment')
      .update({
        manual_url: result.manual_url,
        manual_cached_data: {
          summary: result.manual_summary,
          sections: result.maintenance_sections,
          fetched_at: new Date().toISOString(),
        } as any,
      })
      .eq('id', equipment_id)

    res.json(result)
  } catch (error) {
    logger.error('Manual lookup failed', { error: (error as Error).message })
    res.status(500).json({ error: 'Failed to lookup manual' })
  }
})

export default router
