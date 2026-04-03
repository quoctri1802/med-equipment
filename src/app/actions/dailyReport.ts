"use server"

import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function getDailyStatus(filters?: { department?: string, status?: string, startDate?: string, endDate?: string }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Unauthorized")
  }

  // Mặc định là ngày hôm nay nếu không có filter ngày
  const startDay = filters?.startDate ? new Date(filters.startDate) : new Date()
  startDay.setHours(0, 0, 0, 0)
  
  const endDay = filters?.endDate ? new Date(filters.endDate) : new Date()
  endDay.setHours(23, 59, 59, 999)

  // 1. Lọc danh sách LOGS trong khoảng thời gian
  const whereLog: any = {
    createdAt: { 
      gte: startDay,
      lte: endDay
    }
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

  // 2. Lấy danh sách Thiết bị CHƯA báo cáo trong khoảng thời gian đó
  // Một thiết bị được coi là "Missing" nếu không có bất kỳ Log nào trong khoảng thời gian đã chọn
  const reportedEquipmentIds = dailyLogs.map(log => log.equipmentId)
  
  const whereMissing: any = {
    id: {
      notIn: reportedEquipmentIds
    }
  }

  if (filters?.department && filters.department !== "ALL") {
    whereMissing.department = filters.department
  }
  if (filters?.status && filters.status !== "ALL") {
    whereMissing.status = filters.status
  }

  const missingEquipments = await prisma.equipment.findMany({
    where: whereMissing,
    orderBy: { department: 'asc' }
  })

  // Loại bỏ các log trùng lặp cho cùng 1 thiết bị trong kết quả hiển thị (chỉ lấy log mới nhất)
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
