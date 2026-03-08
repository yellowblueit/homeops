import { analyzeRecallRelevance } from './claude.service.js'
import { supabaseAdmin } from '../utils/supabase.js'
import { logger } from '../utils/logger.js'

interface RecallResult {
  has_recall: boolean
  recalls: Array<{
    recall_number: string
    date: string
    description: string
    hazard: string
    remedy: string
    url: string
  }>
}

export async function checkRecalls(
  equipmentId: string,
  manufacturer: string,
  modelNumber: string,
  productDescription: string
): Promise<RecallResult> {
  try {
    // Update status to checking
    await supabaseAdmin
      .from('equipment')
      .update({ recall_status: 'checking' })
      .eq('id', equipmentId)

    // Query CPSC Recalls API
    const query = encodeURIComponent(`${manufacturer} ${modelNumber}`.trim())
    const cpscUrl = `https://www.saferproducts.gov/RestWebServices/Recall?format=json&ProductName=${query}`

    const response = await fetch(cpscUrl)
    if (!response.ok) {
      logger.warn('CPSC API request failed', { status: response.status })
      await supabaseAdmin
        .from('equipment')
        .update({ recall_status: 'none', recall_last_checked: new Date().toISOString() })
        .eq('id', equipmentId)
      return { has_recall: false, recalls: [] }
    }

    const cpscData = await response.json()

    if (!Array.isArray(cpscData) || cpscData.length === 0) {
      await supabaseAdmin
        .from('equipment')
        .update({
          recall_status: 'clear',
          recall_data: null,
          recall_last_checked: new Date().toISOString(),
        })
        .eq('id', equipmentId)
      return { has_recall: false, recalls: [] }
    }

    // Use Claude to determine relevance
    const analysis = await analyzeRecallRelevance(
      manufacturer,
      modelNumber,
      productDescription,
      cpscData
    )

    const status = analysis.is_recalled ? 'recalled' : 'clear'
    await supabaseAdmin
      .from('equipment')
      .update({
        recall_status: status,
        recall_data: analysis.relevant_recalls as any,
        recall_last_checked: new Date().toISOString(),
      })
      .eq('id', equipmentId)

    return {
      has_recall: analysis.is_recalled,
      recalls: (analysis.relevant_recalls || []) as RecallResult['recalls'],
    }
  } catch (error) {
    logger.error('Recall check failed', {
      equipmentId,
      error: (error as Error).message,
    })
    await supabaseAdmin
      .from('equipment')
      .update({ recall_status: 'none', recall_last_checked: new Date().toISOString() })
      .eq('id', equipmentId)
    throw error
  }
}

export async function batchCheckRecalls() {
  // Find equipment not checked in 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: equipment, error } = await supabaseAdmin
    .from('equipment')
    .select('id, manufacturer, model_number, name')
    .eq('status', 'active')
    .or(`recall_last_checked.is.null,recall_last_checked.lt.${thirtyDaysAgo.toISOString()}`)
    .limit(50)

  if (error || !equipment) {
    logger.error('Failed to fetch equipment for batch recall check', { error })
    return
  }

  logger.info(`Batch checking recalls for ${equipment.length} items`)

  for (const item of equipment) {
    try {
      await checkRecalls(
        item.id,
        item.manufacturer || '',
        item.model_number || '',
        item.name
      )
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      logger.error('Batch recall check failed for item', {
        equipmentId: item.id,
        error: (error as Error).message,
      })
    }
  }
}
