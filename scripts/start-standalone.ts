import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'

const standaloneRoot = resolve(process.cwd(), '.next/standalone')
const standaloneServerCandidates = [
  resolve(standaloneRoot, 'server.js'),
  resolve(standaloneRoot, 'PuspaCare/server.js'),
]
const serverPath = standaloneServerCandidates.find((candidate) => existsSync(candidate))
const localSqliteDatabaseUrl = `file:${resolve(process.cwd(), 'db/custom.db').replace(/\\/g, '/')}`

function normalizeSqliteDatabaseUrl(value: string | undefined) {
  if (!value?.startsWith('file:')) {
    return value
  }

  const databasePath = value.slice('file:'.length)

  if (databasePath.startsWith('/') || /^[A-Za-z]:[\\/]/.test(databasePath)) {
    return value
  }

  return localSqliteDatabaseUrl
}

if (!serverPath) {
  console.error(
    `Standalone server not found in ${standaloneServerCandidates.join(' or ')}. Run \`bun run build\` first.`,
  )
  process.exit(1)
}

const env = {
  ...process.env,
  NODE_ENV: 'production',
} as NodeJS.ProcessEnv & Record<string, string | undefined>

if (!env.NEXTAUTH_SECRET) {
  env.NEXTAUTH_SECRET = 'puspa-local-standalone-preview-secret-change-me'
  console.warn(
    '[auth] NEXTAUTH_SECRET is not set. Using a local-only fallback for `bun run start`. Set NEXTAUTH_SECRET in real deployments.',
  )
}

env.DATABASE_URL = normalizeSqliteDatabaseUrl(env.DATABASE_URL)

if (!env.DATABASE_URL) {
  env.DATABASE_URL = localSqliteDatabaseUrl
  console.warn(
    `[db] DATABASE_URL is not set. Using local SQLite fallback \`${localSqliteDatabaseUrl}\` for standalone preview.`,
  )
}

env.DIRECT_URL = normalizeSqliteDatabaseUrl(env.DIRECT_URL)

if (!env.DIRECT_URL) {
  env.DIRECT_URL = env.DATABASE_URL
}

const port = env.PORT || '3000'
const configuredAuthUrl = env.NEXTAUTH_URL ? new URL(env.NEXTAUTH_URL) : null

if (
  !configuredAuthUrl ||
  ((configuredAuthUrl.hostname === 'localhost' || configuredAuthUrl.hostname === '127.0.0.1') &&
    configuredAuthUrl.port !== port)
) {
  env.NEXTAUTH_URL = `http://localhost:${port}`
}

const child = spawn(process.execPath, [serverPath], {
  cwd: process.cwd(),
  env,
  stdio: 'inherit' as const,
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
