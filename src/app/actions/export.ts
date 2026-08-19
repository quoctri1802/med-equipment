"use server"

import { formatDateVN } from '@/lib/date'
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getReportData(filters: {
  status?: string,
  startDate?: string,
  endDate?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Unauthorized")
  }

  // Force retrieve only XN (Laboratory) equipment
  const whereClause: any = {
    department: "XN"
  }
  
  if (filters.status && filters.status !== "ALL") {
    whereClause.status = filters.status
  }

  if (filters.startDate && filters.endDate) {
    whereClause.createdAt = {
      gte: new Date(filters.startDate + 'T00:00:00+07:00'),
      lte: new Date(filters.endDate + 'T23:59:59+07:00')
    }
  }

  const now = new Date()
  
  const equipments = await prisma.equipment.findMany({
    where: whereClause,
    include: {
      maintenances: {
        orderBy: { date: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Format data for Excel
  const excelData = equipments.map(eq => {
    const totalMaintenanceCost = eq.maintenances.reduce((sum, m) => sum + (m.cost || 0), 0)
    const upcomingOrOverdue = eq.maintenances.find(m => m.status !== "COMPLETED")
    
    let nextDate = "Không có lịch"
    let maintenanceStatus = "N/A"
    let isOverdue = false

    if (upcomingOrOverdue) {
      nextDate = formatDateVN(upcomingOrOverdue.date)
      maintenanceStatus = upcomingOrOverdue.status === "PENDING" ? "Chờ xử lý" : "Đang sửa chữa"
      isOverdue = new Date(upcomingOrOverdue.date) < now
    }
    
    const statusLabels: Record<string, string> = {
      WORKING: "Sẵn sàng",
      WARNING: "Cần hiệu chuẩn",
      BROKEN: "Sự cố / Hỏng"
    }

    return {
      "Mã Thiết Bị": eq.code,
      "Tên Thiết Bị": eq.name,
      "Model": eq.model || "--",
      "Số Serial": eq.serialNumber || "--",
      "Hãng Sản Xuất": eq.brand || "--",
      "Nước Sản Xuất": eq.origin || "--",
      "KTV Hiệu Chuẩn QC": eq.qcTechnician || "--",
      "Trạng Thái": statusLabels[eq.status] || eq.status,
      "Mức Rủi Ro": eq.riskScore,
      "Ngày Vận Hành": formatDateVN(eq.purchaseDate),
      "Số Lần Bảo Trì": eq.maintenances.length,
      "Tổng Chi Phí Bảo Trì (VND)": totalMaintenanceCost,
      "Lịch Bảo Trì Tới": nextDate,
      "Trạng Thái Bảo Trì": maintenanceStatus,
      "isOverdue": isOverdue
    }
  })

  return excelData
}
