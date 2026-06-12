import { Router } from 'express'

import {
  register,
  login,
  refresh,
  logout,
  me,
} from '../controllers/auth.controller.js'

import {
  registerValidator,
  loginValidator,
} from '../validators/auth.validator.js'

import { authenticate } from '../middleware/auth.middleware.js'


const router = Router()

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - name
 *             properties:
 *               username:
 *                 type: string
 *                 example: ivan_petrenko
 *               password:
 *                 type: string
 *                 example: password123
 *               name:
 *                 type: string
 *                 example: Іван
 *     responses:
 *       201:
 *         description: User successfully registered
 *       409:
 *         description: User with this username already exists
 */

router.post(
  '/register',
  registerValidator,
  register
)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: ivan_petrenko
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

router.post(
  '/login',
  loginValidator,
  login
)

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Unauthorized
 */

router.get(
  '/me',
  authenticate,
  me
)

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens refreshed
 *       401:
 *         description: Invalid refresh token
 */

router.post(
  '/refresh',
  refresh
)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */

router.post(
  '/logout',
  authenticate,
  logout
)

export default router