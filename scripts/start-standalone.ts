import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'

const serverPath = resolve(process.cwd(), '.next/standalone/server.js')
const localSqliteDatabaseUrl = `file:${resolve(process.cwd(), 'db/custom.db').replace(/\\/g, '/')}`

if (!existsSync(serverPath)) {
  console.error('Standalone server not found. Run `bun run build` first.')
  process.exit(1)
}

const env = {
  ...process.env,
  NODE_ENV: 'production',
} as NodeJS.ProcessEnv & Record<string, string | undefined>

if (!env.NEXTAUTH_SECRET) {
  env.NEXTAUTH_SECRET = 'puspa-local-production-secret-change-me'
  console.warn(
    '[auth] NEXTAUTH_SECRET is not set. Using a local-only fallback for `bun run start`. Set NEXTAUTH_SECRET in real deployments.',
  )
}

if (!env.DATABASE_URL) {
  env.DATABASE_URL = localSqliteDatabaseUrl
  console.warn(
    `[db] DATABASE_URL is not set. Using local SQLite fallback \`${localSqliteDatabaseUrl}\` for standalone preview.`,
  )
}

if (!env.DIRECT_URL) {
  env.DIRECT_URL = env.DATABASE_URL
}

if (!env.NEXTAUTH_URL) {
  const port = env.PORT || '3000'
  env.NEXTAUTH_URL = `http://127.0.0.1:${port}`
}

const child = spawn(process.execPath, [serverPath], {
  cwd: process.cwd(),
  env,
  stdio: 'inherit' as const,
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
