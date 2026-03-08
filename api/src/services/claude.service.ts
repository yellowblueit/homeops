import Anthropic from '@anthropic-ai/sdk'
import { config } from '../config.js'
import { logger } from '../utils/logger.js'

const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey })

export interface MaintenanceRecommendation {
  title: string
  description: string
  frequency_type: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimated_duration_minutes: number
  reasoning: string
  confidence: number
}

export interface ManualResult {
  manual_url: string | null
  manual_summary: string | null
  maintenance_sections: Array<{
    title: string
    content: string
    frequency: string
  }>
}

export async function getMaintenanceRecommendations(params: {
  manufacturer: string
  model_number: string
  category: string
  installed_date: string | null
  home_year_built: number | null
}): Promise<MaintenanceRecommendation[]> {
  const prompt = `You are a home maintenance expert. Given the following equipment, suggest a conservative maintenance schedule. Do NOT overburden the homeowner - only recommend tasks that are truly important for longevity, safety, and efficiency.

Equipment:
- Category: ${params.category}
- Manufacturer: ${params.manufacturer}
- Model: ${params.model_number || 'Unknown'}
- Installed: ${params.installed_date || 'Unknown'}
- Home built: ${params.home_year_built || 'Unknown'}

For each recommended task, provide:
1. title: Brief, action-oriented task name
2. description: 1-2 sentence explanation
3. frequency_type: One of [daily, weekly, biweekly, monthly, quarterly, semi_annual, annual]
4. priority: One of [low, medium, high, critical]
5. estimated_duration_minutes: Integer estimate
6. reasoning: Why this task matters
7. confidence: 0.0-1.0 how confident you are this applies

Keep recommendations to 3-5 tasks maximum. Focus on safety-critical and efficiency tasks.
Respond with ONLY a valid JSON array of objects, no other text.`

  try {
    const response = await anthropic.messages.create({
      model: config.anthropic.model,
      max_tokens: 2048,
      system: 'You are a home maintenance expert. Always respond with valid JSON arrays only, no markdown or extra text.',
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      logger.warn('AI response did not contain valid JSON array', { text })
      return []
    }
    return JSON.parse(jsonMatch[0])
  } catch (error) {
    logger.error('Claude API error', { error: (error as Error).message })
    throw error
  }
}

export async function extractManualInfo(
  manufacturer: string,
  model: string,
  pageContent: string
): Promise<ManualResult> {
  const response = await anthropic.messages.create({
    model: config.anthropic.model,
    max_tokens: 2048,
    system: 'You are a home maintenance expert. Respond with valid JSON only.',
    messages: [{
      role: 'user',
      content: `Extract maintenance schedule information from this content for a ${manufacturer} ${model}.

Return JSON: {
  "manual_summary": "Brief summary of what this equipment is",
  "maintenance_sections": [
    { "title": "Task name", "content": "Instructions", "frequency": "how often" }
  ]
}

Content (truncated):
${pageContent.substring(0, 6000)}`,
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return { manual_url: null, manual_summary: null, maintenance_sections: [] }

  const parsed = JSON.parse(jsonMatch[0])
  return {
    manual_url: null,
    manual_summary: parsed.manual_summary || null,
    maintenance_sections: parsed.maintenance_sections || [],
  }
}

export async function analyzeRecallRelevance(
  manufacturer: string,
  model: string,
  description: string,
  recallData: unknown[]
): Promise<{ relevant_recalls: unknown[]; is_recalled: boolean }> {
  const response = await anthropic.messages.create({
    model: config.anthropic.model,
    max_tokens: 1024,
    system: 'You are a product safety expert. Respond with valid JSON only.',
    messages: [{
      role: 'user',
      content: `Given this equipment: ${manufacturer} ${model} (${description})

And these CPSC recall results:
${JSON.stringify(recallData.slice(0, 5))}

Determine which recalls are relevant to this specific equipment.
Return JSON: { "relevant_recalls": [...], "is_recalled": boolean }`,
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return { relevant_recalls: [], is_recalled: false }
  return JSON.parse(jsonMatch[0])
}
