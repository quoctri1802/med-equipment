import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import MaintenanceManager from "@/components/MaintenanceManager"

const prisma = new PrismaClient()

export default async function MaintenancePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return <div>Bạn cần đăng nhập để xem trang này.</div>
  }

  const [maintenanceRecords, equipments, technicians] = await Promise.all([
    prisma.maintenance.findMany({
      include: {
        equipment: true,
        technician: true
      },
      orderBy: {
        date: 'desc'
      }
    }),
    prisma.equipment.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' }
    }),
    prisma.user.findMany({
      where: { role: { in: ['TECHNICIAN', 'ADMIN'] } }, // Anyone who can do maintenance
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' }
    })
  ])

  return (
    <MaintenanceManager 
      records={maintenanceRecords as any}
      equipments={equipments}
      technicians={technicians}
    />
  )
}
