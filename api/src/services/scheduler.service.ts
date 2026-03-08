import cron from 'node-cron'
import { supabaseAdmin } from '../utils/supabase.js'
import { sendWeeklyDigest } from './email.service.js'
import { batchCheckRecalls } from './recall.service.js'
import { logger } from '../utils/logger.js'

export function startScheduler() {
  // Weekly digest - Monday 8:00 AM server time
  cron.schedule('0 8 * * 1', async () => {
    logger.info('Running weekly digest cron')
    try {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, notification_preferences')

      if (!profiles) return

      for (const profile of profiles) {
        const prefs = profile.notification_preferences as any
        if (prefs?.weekly_digest !== false) {
          try {
            await sendWeeklyDigest(profile.id)
          } catch (error) {
            logger.error('Failed to send digest for user', {
              userId: profile.id,
              error: (error as Error).message,
            })
          }
        }
      }
    } catch (error) {
      logger.error('Weekly digest cron failed', { error: (error as Error).message })
    }
  })

  // Nightly recall check - 3:00 AM
  cron.schedule('0 3 * * *', async () => {
    logger.info('Running nightly recall check')
    try {
      await batchCheckRecalls()
    } catch (error) {
      logger.error('Nightly recall check failed', { error: (error as Error).message })
    }
  })

  logger.info('Scheduler started: weekly digest (Mon 8AM), nightly recall check (3AM)')
}
