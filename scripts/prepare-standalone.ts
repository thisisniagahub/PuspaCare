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
const standaloneRoot = path.join(root, '.next', 'standalone')
const standaloneTargets = [
  standaloneRoot,
  path.join(standaloneRoot, path.basename(root)),
]

for (const targetRoot of standaloneTargets) {
  await copyIfExists(
    path.join(root, '.next', 'static'),
    path.join(targetRoot, '.next', 'static')
  )

  await copyIfExists(
    path.join(root, 'public'),
    path.join(targetRoot, 'public')
  )
}

console.log('Standalone assets prepared')
