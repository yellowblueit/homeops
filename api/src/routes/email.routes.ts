import { Router } from 'express'
import type { Response } from 'express'
import { sendWeeklyDigest, sendInvitationEmail } from '../services/email.service.js'
import { supabaseAdmin } from '../utils/supabase.js'
import { logger } from '../utils/logger.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()

// POST /api/email/send-invitation
router.post('/send-invitation', async (req: AuthenticatedRequest, res: Response) => {
  const { invitation_id, home_name, inviter_name } = req.body

  if (!invitation_id) {
    res.status(400).json({ error: 'invitation_id is required' })
    return
  }

  try {
    const { data: invitation } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('id', invitation_id)
      .single()

    if (!invitation) {
      res.status(404).json({ error: 'Invitation not found' })
      return
    }

    await sendInvitationEmail({
      email: invitation.invited_email,
      homeName: home_name || 'Home',
      inviterName: inviter_name || 'A team member',
      token: invitation.token,
      role: invitation.role,
    })

    res.json({ success: true })
  } catch (error) {
    logger.error('Send invitation failed', { error: (error as Error).message })
    res.status(500).json({ error: 'Failed to send invitation' })
  }
})

// POST /api/email/send-digest (for testing / manual trigger)
router.post('/send-digest', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  try {
    await sendWeeklyDigest(userId)
    res.json({ success: true })
  } catch (error) {
    logger.error('Manual digest send failed', { error: (error as Error).message })
    res.status(500).json({ error: 'Failed to send digest' })
  }
})

export default router
