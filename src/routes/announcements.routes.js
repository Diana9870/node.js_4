import { Router } from 'express'

import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcements.controller.js'

import {
  getAnnouncementsValidator,
  createAnnouncementValidator,
  updateAnnouncementValidator,
  idValidator,
} from '../validators/announcements.validator.js'

import { authenticate } from '../middleware/auth.middleware.js'
import upload from '../middleware/upload.middleware.js'

const router = Router()

/**
 * @swagger
 * /announcements:
 *   get:
 *     summary: Get announcements list
 *     tags: [Announcements]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search announcements by title
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum:
 *             - newest
 *             - oldest
 *         description: Sort announcements
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of announcements
 */
router.get('/', getAnnouncementsValidator, getAnnouncements)

/**
 * @swagger
 * /announcements/{id}:
 *   get:
 *     summary: Get announcement by ID
 *     tags: [Announcements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Announcement ID
 *     responses:
 *       200:
 *         description: Announcement found
 *       404:
 *         description: Announcement not found
 */
router.get('/:id', idValidator, getAnnouncementById)

/**
 * @swagger
 * /announcements:
 *   post:
 *     summary: Create announcement
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - category
 *               - contactInfo
 *             properties:
 *               title:
 *                 type: string
 *                 example: iPhone 15 Pro
 *               description:
 *                 type: string
 *                 example: New phone in perfect condition
 *               price:
 *                 type: number
 *                 example: 35000
 *               category:
 *                 type: string
 *                 enum:
 *                   - sale
 *                   - service
 *                   - job
 *                   - other
 *               contactInfo:
 *                 type: string
 *                 example: +380991112233
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Announcement created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid or expired token
 */
router.post(
  '/',
  authenticate,
  upload.single('image'),
  createAnnouncementValidator,
  createAnnouncement,
)

/**
 * @swagger
 * /announcements/{id}:
 *   patch:
 *     summary: Update announcement
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Announcement ID
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum:
 *                   - sale
 *                   - service
 *                   - job
 *                   - other
 *               contactInfo:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Announcement updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid or expired token
 *       403:
 *         description: Access denied
 *       404:
 *         description: Announcement not found
 */
router.patch(
  '/:id',
  authenticate,
  upload.single('image'),
  idValidator,
  updateAnnouncementValidator,
  updateAnnouncement,
)

/**
 * @swagger
 * /announcements/{id}:
 *   delete:
 *     summary: Delete announcement
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Announcement ID
 *     responses:
 *       200:
 *         description: Announcement deleted successfully
 *       401:
 *         description: Invalid or expired token
 *       403:
 *         description: Access denied
 *       404:
 *         description: Announcement not found
 */
router.delete(
  '/:id',
  authenticate,
  idValidator,
  deleteAnnouncement,
)

export default router
