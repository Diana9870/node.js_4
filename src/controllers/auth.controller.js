import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import createHttpError from 'http-errors'

import prisma from '../../prisma/client.js'
import logger from '../logger.js'

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m',
    },
  )

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: '7d',
    },
  )

  return {
    accessToken,
    refreshToken,
  }
}

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
}

export async function register(req, res) {
  const { username, password, name } = req.body

  const existingUser =
    await prisma.user.findUnique({
      where: {
        username,
      },
    })

  if (existingUser) {
    throw createHttpError(
      409,
      'User with this username already exists',
    )
  }

  const hashedPassword =
    await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      name,
    },
  })

  const tokens = generateTokens(user.id)

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
    },
  })

  res.cookie(
    'refreshToken',
    tokens.refreshToken,
    cookieOptions,
  )

  logger.info(
    `User registered: ${user.username}`,
  )

  res.status(201).json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  })
}

export async function login(req, res) {
  const { username, password } = req.body

  const user =
    await prisma.user.findUnique({
      where: {
        username,
      },
    })

  if (!user) {
    throw createHttpError(
      401,
      'Invalid credentials',
    )
  }

  const isValid = await bcrypt.compare(
    password,
    user.password,
  )

  if (!isValid) {
    throw createHttpError(
      401,
      'Invalid credentials',
    )
  }

  await prisma.refreshToken.deleteMany({
    where: {
      userId: user.id,
    },
  })

  const tokens = generateTokens(user.id)

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
    },
  })

  res.cookie(
    'refreshToken',
    tokens.refreshToken,
    cookieOptions,
  )

  logger.info(
    `User logged in: ${user.username}`,
  )

  res.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  })
}

export async function me(req, res) {
  const user =
    await prisma.user.findUniqueOrThrow({
      where: {
        id: req.user.id,
      },
    })

  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    createdAt: user.createdAt,
  })
}

export async function refresh(req, res) {
  const refreshToken =
    req.cookies.refreshToken ||
    req.body.refreshToken

  if (!refreshToken) {
    throw createHttpError(
      401,
      'Invalid refresh token',
    )
  }

  let payload

  try {
    payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
    )
  } catch {
    throw createHttpError(
      401,
      'Invalid refresh token',
    )
  }

  const storedToken =
    await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
    })

  if (!storedToken) {
    throw createHttpError(
      401,
      'Invalid refresh token',
    )
  }

  await prisma.refreshToken.delete({
    where: {
      token: refreshToken,
    },
  })

  const tokens = generateTokens(payload.id)

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: payload.id,
    },
  })

  res.cookie(
    'refreshToken',
    tokens.refreshToken,
    cookieOptions,
  )

  logger.info(
    `Token refreshed for user ${payload.id}`,
  )

  res.json(tokens)
}

export async function logout(req, res) {
  const refreshToken =
    req.cookies.refreshToken

  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: {
        token: refreshToken,
      },
    })
  }

  res.clearCookie('refreshToken')

  logger.info('User logged out')

  res.json({
    message: 'Logged out successfully',
  })
}