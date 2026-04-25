import { access, cp, mkdir } from 'node:fs/promises'
import path from 'node:path'

async function copyIfExists(from: string, to: string) {
  try {
    await access(from)
  } catch {
    return
  }

  await mkdir(path.dirname(to), { recursive: true })
  await cp(from, to, { recursive: true, force: true })
}

const root = process.cwd()

await copyIfExists(
  path.join(root, '.next', 'static'),
  path.join(root, '.next', 'standalone', '.next', 'static')
)

await copyIfExists(
  path.join(root, 'public'),
  path.join(root, '.next', 'standalone', 'public')
)

console.log('Standalone assets prepared')
