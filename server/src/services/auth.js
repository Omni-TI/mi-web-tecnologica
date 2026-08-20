/**
 * Auth: bcrypt (hash) + JWT (access + refresh).
 *
 * Los tokens se envían al cliente como cookies HttpOnly (`sr_access`,
 * `sr_refresh`) — el JS del navegador NUNCA los ve. `Secure` + `SameSite=Strict`.
 *
 * Rate limit y bloqueo por intentos fallidos: `failed_attempts` en el registro
 * del usuario; tras `MAX_ATTEMPTS`, `locked_until` bloquea el login por
 * `LOCK_MS` milisegundos (además del rate limit por IP en el router).
 */
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { config } from '../config/env.js'
import { findUserByUsername, updateUserAttempts } from './users.js'

const MAX_ATTEMPTS = 5
const LOCK_MS = 15 * 60 * 1000

export const COOKIE_ACCESS = 'sr_access'
export const COOKIE_REFRESH = 'sr_refresh'

/** Configuración común de cookies (Secure solo en prod para permitir dev HTTP). */
export function cookieOptions({ maxAgeMs, refresh = false } = {}) {
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: config.env === 'production',
    path: refresh ? '/api/auth' : '/',
    maxAge: maxAgeMs,
  }
}

/** Hash de contraseña (usado por el CLI create-admin). */
export function hashPassword(plain) {
  return bcrypt.hash(plain, config.auth.bcryptRounds)
}

/** Compara contraseña plana contra hash bcrypt (constant-time). */
export function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash)
}

/** Firma access + refresh tokens. */
export function issueTokens(user) {
  const payload = { sub: user.id, username: user.username, role: user.role || 'admin' }
  const access = jwt.sign(payload, config.auth.jwtAccessSecret, {
    expiresIn: config.auth.jwtAccessTtl,
  })
  const refresh = jwt.sign({ sub: user.id, t: 'refresh' }, config.auth.jwtRefreshSecret, {
    expiresIn: config.auth.jwtRefreshTtl,
  })
  return { access, refresh }
}

export function verifyAccess(token) {
  return jwt.verify(token, config.auth.jwtAccessSecret)
}

export function verifyRefresh(token) {
  return jwt.verify(token, config.auth.jwtRefreshSecret)
}

/**
 * Autentica un usuario. Devuelve el user (sin hash) o lanza con .code descriptivo.
 * Códigos: INVALID_CREDENTIALS | USER_LOCKED | AUTH_MISCONFIG
 */
export async function authenticate(username, password) {
  if (!config.auth.jwtAccessSecret || !config.auth.jwtRefreshSecret) {
    const e = new Error('Auth no configurado (faltan JWT_ACCESS_SECRET / JWT_REFRESH_SECRET).')
    e.code = 'AUTH_MISCONFIG'; e.status = 500
    throw e
  }
  const user = await findUserByUsername(username)
  // Respuesta genérica para no filtrar existencia del usuario.
  if (!user) {
    // Trabajo constante contra timing side-channels: hash falso.
    await bcrypt.compare(password, '$2b$12$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuvwxyz01')
    const e = new Error('Credenciales inválidas.'); e.code = 'INVALID_CREDENTIALS'; e.status = 401
    throw e
  }
  if (user.locked_until && Date.now() < new Date(user.locked_until).getTime()) {
    const e = new Error('Cuenta temporalmente bloqueada por intentos fallidos.')
    e.code = 'USER_LOCKED'; e.status = 423
    throw e
  }
  const ok = await verifyPassword(password, user.password_hash)
  if (!ok) {
    const attempts = (user.failed_attempts || 0) + 1
    const locked = attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_MS).toISOString() : ''
    await updateUserAttempts(user.username, { failed_attempts: attempts, locked_until: locked })
    const e = new Error('Credenciales inválidas.'); e.code = 'INVALID_CREDENTIALS'; e.status = 401
    throw e
  }
  // Login exitoso: reset de intentos.
  if (user.failed_attempts || user.locked_until) {
    await updateUserAttempts(user.username, { failed_attempts: 0, locked_until: '' })
  }
  // eslint-disable-next-line no-unused-vars
  const { password_hash, ...safe } = user
  return safe
}
