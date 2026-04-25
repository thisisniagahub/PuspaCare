import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/password'

const prisma = new PrismaClient()

async function main() {
  const password = 'Puspa@2026'
  const hashedPassword = await hashPassword(password)
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@puspa.org.my' },
    update: { password: hashedPassword, role: 'admin', isActive: true },
    create: {
      email: 'admin@puspa.org.my',
      password: hashedPassword,
      name: 'Pentadbir PUSPA',
      role: 'admin',
      isActive: true,
      phone: '03-4107 8899'
    }
  })
  
  console.log('Admin password reset successful for:', user.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
