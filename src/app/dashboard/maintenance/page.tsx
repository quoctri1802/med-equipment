import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import MaintenanceManager from "@/components/MaintenanceManager"

import prisma from "@/lib/prisma"

export default async function MaintenancePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return <div>Bạn cần đăng nhập để xem trang này.</div>
  }

  // Lọc chỉ lấy bảo trì của thiết bị Khoa Xét nghiệm
  const [maintenanceRecords, equipments, technicians] = await Promise.all([
    prisma.maintenance.findMany({
      where: {
        equipment: {
          department: "XN"
        }
      },
      include: {
        equipment: true,
        technician: true
      },
      orderBy: {
        date: 'desc'
      }
    }),
    prisma.equipment.findMany({
      where: {
        department: "XN"
      },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' }
    }),
    prisma.user.findMany({
      where: { role: { in: ['TECHNICIAN', 'ADMIN'] } }, // Bất kỳ ai có quyền sửa chữa
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
