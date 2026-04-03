"use server"

import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function getDailyStatus(filters?: { department?: string, status?: string }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Unauthorized")
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 1. Lọc danh sách LOGS hôm nay
  const whereLog: any = {
    createdAt: { gte: today }
  }
  
  if (filters?.department && filters.department !== "ALL") {
    whereLog.equipment = { department: filters.department }
  }
  if (filters?.status && filters.status !== "ALL") {
    whereLog.status = filters.status
  }

  const dailyLogs = await prisma.log.findMany({
    where: whereLog,
    include: {
      equipment: true,
      user: true
    },
    orderBy: { createdAt: 'desc' }
  })

  // 2. Lấy danh sách Thiết bị CHƯA báo cáo (theo filter)
  const whereMissing: any = {
    id: {
      notIn: dailyLogs.map(log => log.equipmentId)
    }
  }

  if (filters?.department && filters.department !== "ALL") {
    whereMissing.department = filters.department
  }
  // Mặc định thiết bị chưa báo cáo thì ta không lọc theo status của LOG, 
  // nhưng nếu người dùng muốn lọc thiết bị đang có status cụ thể mà CHƯA báo cáo hôm nay:
  if (filters?.status && filters.status !== "ALL") {
    whereMissing.status = filters.status
  }

  const missingEquipments = await prisma.equipment.findMany({
    where: whereMissing,
    orderBy: { department: 'asc' }
  })

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
