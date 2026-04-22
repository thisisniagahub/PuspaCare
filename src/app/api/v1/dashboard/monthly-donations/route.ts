import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis']
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()

    const donations = await db.donation.findMany({
      where: {
        status: 'confirmed',
        donatedAt: {
          gte: new Date(currentYear, 0, 1),
          lte: new Date(currentYear, 11, 31),
        },
      },
      select: {
        amount: true,
        fundType: true,
        donatedAt: true,
      },
    })

    const monthlyData = months.map((month, index) => {
      const monthDonations = donations.filter((donation) => {
        const donationDate = new Date(donation.donatedAt)
        return donationDate.getMonth() === index
      })

      return {
        month,
        zakat: monthDonations.filter((x) => x.fundType === 'zakat').reduce((sum, x) => sum + x.amount, 0),
        sadaqah: monthDonations.filter((x) => x.fundType === 'sadaqah').reduce((sum, x) => sum + x.amount, 0),
        waqf: monthDonations.filter((x) => x.fundType === 'waqf').reduce((sum, x) => sum + x.amount, 0),
        infaq: monthDonations.filter((x) => x.fundType === 'infaq').reduce((sum, x) => sum + x.amount, 0),
        general: monthDonations.filter((x) => x.fundType === 'donation_general').reduce((sum, x) => sum + x.amount, 0),
      }
    })

    return NextResponse.json({ success: true, data: monthlyData })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
