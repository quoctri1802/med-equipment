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

  // Lọc dựa trên ngày bảo trì (Mở rộng cho phức tạp nếu cần)
  // Ở đây giả sử lấy thông tin cơ bản thiết bị và mảng báo cáo.
  
  const equipments = await prisma.equipment.findMany({
    where: whereClause,
    include: {
      maintenances: {
        where: {
          date: {
            gte: filters.startDate ? new Date(filters.startDate) : undefined,
            lte: filters.endDate ? new Date(filters.endDate) : undefined
          }
        },
        orderBy: { date: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Định dạng lại data trả về cho Excel
  const excelData = equipments.map(eq => {
    // Tính tổng chi phí bảo trì
    const totalMaintenanceCost = eq.maintenances.reduce((sum, m) => sum + (m.cost || 0), 0)
    
    return {
      "Mã Thiết Bị": eq.code,
      "Tên Thiết Bị": eq.name,
      "Khoa / Phòng": eq.department,
      "Trạng Thái": eq.status,
      "Mức Rủi Ro": eq.riskScore,
      "Ngày Mua": new Date(eq.purchaseDate).toLocaleDateString('vi-VN'),
      "Số Lần Bảo Trì": eq.maintenances.length,
      "Tổng Chi Phí Bảo Trì (VND)": totalMaintenanceCost
    }
  })

  return excelData
}
