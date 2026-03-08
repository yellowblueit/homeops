import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { logger } from '../utils/logger.js'

export interface AuthenticatedRequest extends Request {
  userId?: string
  userEmail?: string
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as {
      sub: string
      email: string
      role: string
    }
    req.userId = decoded.sub
    req.userEmail = decoded.email
    next()
  } catch (err) {
    logger.warn('JWT verification failed', { error: (err as Error).message })
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
