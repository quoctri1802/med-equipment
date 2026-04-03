"use server"

import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function getDailyStatus() {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Unauthorized")
  }

  // Lấy thời điểm 00:00 của ngày hôm nay (Local time / Server time)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 1. Lấy danh sách Logs (đã báo cáo) từ 00:00 hôm nay
  const dailyLogs = await prisma.log.findMany({
    where: {
      createdAt: {
        gte: today
      }
    },
    include: {
      equipment: true,
      user: true
    },
    orderBy: { createdAt: 'desc' }
  })

  const reportedEquipmentIds = dailyLogs.map(log => log.equipmentId)

  // 2. Lấy danh sách Thiết bị còn lại (chưa báo cáo hôm nay)
  const missingEquipments = await prisma.equipment.findMany({
    where: {
      id: {
        notIn: reportedEquipmentIds
      }
    },
    orderBy: { department: 'asc' }
  })

  // Group logs lại theo dạng Equipment -> Latest Log nếu có thiết bị được tạo log nhiều lần trong ngày (tuỳ logic, nhưng MVP ta có thể trả thẳng danh sách log).
  // Để giao diện dễ hiển thị "Thiết bị X báo cáo lúc Y" ta sẽ gom nhóm deduplicate.
  const uniqueReportedMap = new Map()
  for (const log of dailyLogs) {
    if (!uniqueReportedMap.has(log.equipmentId)) {
      uniqueReportedMap.set(log.equipmentId, log)
    }
  }

  const reportedEquipments = Array.from(uniqueReportedMap.values())

  return {
    reported: reportedEquipments,
    missing: missingEquipments
  }
}
