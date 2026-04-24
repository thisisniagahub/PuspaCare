import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const KEY_LENGTH = 64
const HASH_PREFIX = 'scrypt'

export function isPasswordHash(value: string): boolean {
  return value.startsWith(`${HASH_PREFIX}$`)
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer

  return `${HASH_PREFIX}$${salt}$${derivedKey.toString('hex')}`
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!isPasswordHash(hash)) {
    return false
  }

  const [, salt, storedHash] = hash.split('$')

  if (!salt || !storedHash) {
    return false
  }

  const expected = Buffer.from(storedHash, 'hex')
  const actual = (await scrypt(password, salt, KEY_LENGTH)) as Buffer

  if (expected.length !== actual.length) {
    return false
  }

  return timingSafeEqual(expected, actual)
}
