import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from './config.js'
import { authMiddleware } from './middleware/auth.js'
import { aiRateLimiter, generalRateLimiter } from './middleware/rateLimiter.js'
import { errorHandler } from './middleware/errorHandler.js'
import { startScheduler } from './services/scheduler.service.js'
import { logger } from './utils/logger.js'

import healthRoutes from './routes/health.routes.js'
import aiRoutes from './routes/ai.routes.js'
import recallsRoutes from './routes/recalls.routes.js'
import propertyRoutes from './routes/property.routes.js'
import emailRoutes from './routes/email.routes.js'

const app = express()

// Global middleware
app.use(helmet())
app.use(cors({
  origin: config.appUrl,
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(generalRateLimiter)

// Health check (no auth required)
app.use('/api/health', healthRoutes)

// Protected routes
app.use('/api/ai', authMiddleware, aiRateLimiter, aiRoutes)
app.use('/api/recalls', authMiddleware, recallsRoutes)
app.use('/api/property', authMiddleware, propertyRoutes)
app.use('/api/email', authMiddleware, emailRoutes)

// Error handler
app.use(errorHandler)

// Start server
app.listen(config.port, () => {
  logger.info(`API server running on port ${config.port}`)
  logger.info(`Environment: ${config.nodeEnv}`)

  // Start cron scheduler
  if (config.nodeEnv === 'production') {
    startScheduler()
  }
})
