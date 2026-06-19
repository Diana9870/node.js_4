import express from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import pinoHttp from 'pino-http'
import { errors as celebrateErrors } from 'celebrate'

import announcementsRouter from './src/routes/announcements.routes.js'
import authRouter from './src/routes/auth.routes.js'
import logger from './src/logger.js'

const app = express()

// Logger
app.use(
  pinoHttp({
    logger,
  }),
)

// Security headers
app.use(helmet())

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : []

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  }),
)

// Body parsers
app.use(express.json())
app.use(cookieParser())

// Rate limit only auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'REST API',
      version: '1.0.0',
      description: 'REST API documentation',
    },

    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },

  apis: ['./src/routes/*.js'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec),
)

// Routes
app.use('/auth', authLimiter, authRouter)
app.use('/announcements', announcementsRouter)

// Celebrate validation errors
app.use(celebrateErrors())

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  })
})

// Global error handler
app.use((err, req, res, next) => {
  req.log.error(err)

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  })
})

export default app