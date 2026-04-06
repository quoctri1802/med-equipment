"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getReportData(filters: {
  status?: string,
  department?: string,
  startDate?: string,
  endDate?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Unauthorized")
  }

  // Lọc thiết bị
  const whereClause: any = {}
  
  if (filters.status && filters.status !== "ALL") {
    whereClause.status = filters.status
  }
  if (filters.department && filters.department !== "ALL") {
    whereClause.department = filters.department
  }

  const now = new Date()
  
  const equipments = await prisma.equipment.findMany({
    where: whereClause,
    include: {
      maintenances: {
        orderBy: { date: 'asc' } // Sắp xếp ngày tăng dần để tìm cái tới sớm nhất
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Định dạng lại data trả về cho Excel
  const excelData = equipments.map(eq => {
    // 1. Tính tổng chi phí bảo trì
    const totalMaintenanceCost = eq.maintenances.reduce((sum, m) => sum + (m.cost || 0), 0)
    
    // 2. Tìm lịch bảo trì sắp tới hoặc quá hạn (chưa hoàn thành)
    const upcomingOrOverdue = eq.maintenances.find(m => m.status !== "COMPLETED")
    
    let maintenanceInfo = {
      nextDate: "không có lịch",
      status: "N/A",
      isOverdue: false
    }

    if (upcomingOrOverdue) {
      maintenanceInfo.nextDate = new Date(upcomingOrOverdue.date).toLocaleDateString('vi-VN')
      maintenanceInfo.status = upcomingOrOverdue.status // PENDING, IN_PROGRESS
      maintenanceInfo.isOverdue = new Date(upcomingOrOverdue.date) < now
    }
    
    return {
      "Mã Thiết Bị": eq.code,
      "Tên Thiết Bị": eq.name,
      "Khoa / Phòng": eq.department,
      "Trạng Thái": eq.status,
      "Mức Rủi Ro": eq.riskScore,
      "Ngày Mua": new Date(eq.purchaseDate).toLocaleDateString('vi-VN'),
      "Số Lần Bảo Trì": eq.maintenances.length,
      "Tổng Chi Phí Bảo Trì (VND)": totalMaintenanceCost,
      // Thông tin bảo trì mới
      "Lịch Bảo Trì Tới": maintenanceInfo.nextDate,
      "Trạng Thái Bảo Trì": maintenanceInfo.status,
      "isOverdue": maintenanceInfo.isOverdue // Metadata dùng để highlight
    }
  })

  return excelData
}
