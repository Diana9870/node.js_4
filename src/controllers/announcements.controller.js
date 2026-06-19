import createHttpError from 'http-errors'
import { unlink } from 'fs/promises'

import prisma from '../../prisma/client.js'
import cloudinary from '../cloudinary.js'
import logger from '../logger.js'

export async function getAnnouncements(req, res) {
  const announcements =
    await prisma.announcement.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

  res.json(announcements)
}

export async function getAnnouncementById(req, res) {
  const announcement =
    await prisma.announcement.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    })

  if (!announcement) {
    throw createHttpError(
      404,
      'Announcement not found',
    )
  }

  res.json(announcement)
}

export async function createAnnouncement(req, res) {
  let imageUrl = null

  if (req.file) {
    const result = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: 'announcements',
      },
    )

    imageUrl = result.secure_url

    await unlink(req.file.path)

    logger.info(
      `Image uploaded for announcement by user ${req.user.id}`,
    )
  }

  const announcement =
    await prisma.announcement.create({
      data: {
        ...req.body,
        imageUrl,
        userId: req.user.id,
      },
    })

  logger.info(
    `Announcement created: ${announcement.id}`,
  )

  res.status(201).json(announcement)
}

export async function updateAnnouncement(req, res) {
  const id = Number(req.params.id)

  const announcement =
    await prisma.announcement.findUnique({
      where: { id },
    })

  if (!announcement) {
    throw createHttpError(
      404,
      'Announcement not found',
    )
  }

  if (announcement.userId !== req.user.id) {
    throw createHttpError(
      403,
      'Access denied',
    )
  }

  const data = {
    ...req.body,
  }

  if (req.file) {
    const result = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: 'announcements',
      },
    )

    data.imageUrl = result.secure_url

    await unlink(req.file.path)

    logger.info(
      `Image updated for announcement ${id}`,
    )
  }

  const updatedAnnouncement =
    await prisma.announcement.update({
      where: {
        id,
      },
      data,
    })

  logger.info(
    `Announcement updated: ${id}`,
  )

  res.json(updatedAnnouncement)
}

export async function deleteAnnouncement(req, res) {
  const id = Number(req.params.id)

  const announcement =
    await prisma.announcement.findUnique({
      where: {
        id,
      },
    })

  if (!announcement) {
    throw createHttpError(
      404,
      'Announcement not found',
    )
  }

  if (announcement.userId !== req.user.id) {
    throw createHttpError(
      403,
      'Access denied',
    )
  }

  await prisma.announcement.delete({
    where: {
      id,
    },
  })

  logger.info(
    `Announcement deleted: ${id}`,
  )

  res.json({
    message:
      'Announcement deleted successfully',
  })
}