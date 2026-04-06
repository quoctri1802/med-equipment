"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getDailyStatus(filters?: { department?: string, status?: string, startDate?: string, endDate?: string }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Unauthorized")
  }

  // Xử lý múi giờ Việt Nam (UTC+7)
  // Khi server chạy UTC, ta cần điều chỉnh để khớp với ngày của người dùng tại Việt Nam
  const VIETNAM_OFFSET = 7;
  
  let startDay: Date;
  if (filters?.startDate) {
    // startDate từ client có dạng "YYYY-MM-DD"
    startDay = new Date(`${filters.startDate}T00:00:00+07:00`);
  } else {
    // Mặc định là đầu ngày hôm nay (giờ VN)
    const now = new Date();
    const vnNow = new Date(now.getTime() + (VIETNAM_OFFSET * 60 * 60 * 1000));
    startDay = new Date(vnNow.toISOString().split('T')[0] + 'T00:00:00+07:00');
  }

  let endDay: Date;
  if (filters?.endDate) {
    endDay = new Date(`${filters.endDate}T23:59:59.999+07:00`);
  } else {
    const vnNow = new Date(new Date().getTime() + (VIETNAM_OFFSET * 60 * 60 * 1000));
    endDay = new Date(vnNow.toISOString().split('T')[0] + 'T23:59:59.999+07:00');
  }

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

  // Trả về toàn bộ danh sách Logs (không deduplicate) để thống kê toàn diện mọi lượt quét
  return {
    reported: dailyLogs,
    missing: missingEquipments
  }
}
