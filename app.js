import express from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import { errors as celebrateErrors } from 'celebrate'
import cookieParser from 'cookie-parser'

import announcementsRouter from './src/routes/announcements.routes.js'
import authRouter from './src/routes/auth.routes.js'

const app = express()

// Swagger configuration
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

// Middlewares
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/announcements', announcementsRouter)
app.use('/auth', authRouter)

// Swagger
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
)

// Celebrate validation errors
app.use(celebrateErrors())

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err)

  // Invalid JSON
  if (
    err.type === 'entity.parse.failed' &&
    err.status === 400
  ) {
    return res.status(400).json({
      error: 'Invalid JSON',
    })
  }

  // http-errors
  if (err.status) {
    return res.status(err.status).json({
      error: err.message,
    })
  }

  // Prisma: Record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Resource not found',
    })
  }

  // Prisma: Unique constraint
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Unique constraint violation',
    })
  }

  // Prisma: Foreign key constraint
  if (err.code === 'P2003') {
    return res.status(400).json({
      error: 'Foreign key constraint failed',
    })
  }

  return res.status(500).json({
    error: 'Internal server error',
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(
    `Swagger docs available at: http://localhost:${PORT}/api-docs`
  )
}
)