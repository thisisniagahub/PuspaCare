import { defineConfig } from 'prisma'

export default defineConfig({
  seed: 'npx tsx prisma/seed.ts',
})
