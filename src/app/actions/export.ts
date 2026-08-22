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

export async function getEquipmentSelectList() {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Vui lòng đăng nhập.")
  }

  return prisma.equipment.findMany({
    where: { department: "XN" },
    select: {
      id: true,
      name: true,
      code: true
    },
    orderBy: { name: "asc" }
  })
}

export async function getIsoExportData(filters: {
  startDate?: string
  endDate?: string
  equipmentId?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Vui lòng đăng nhập.")
  }

  // Define date range
  const startDay = filters.startDate 
    ? new Date(filters.startDate + 'T00:00:00+07:00') 
    : new Date(new Date().setDate(new Date().getDate() - 30))
  const endDay = filters.endDate 
    ? new Date(filters.endDate + 'T23:59:59.999+07:00') 
    : new Date()

  // 1. Daily checklists (Nhật ký vận hành)
  const logWhere: any = {
    createdAt: { gte: startDay, lte: endDay },
    equipment: { department: "XN" }
  }
  if (filters.equipmentId && filters.equipmentId !== "ALL") {
    logWhere.equipmentId = filters.equipmentId
  }
  const logs = await prisma.log.findMany({
    where: logWhere,
    include: {
      equipment: true,
      user: true
    },
    orderBy: { createdAt: 'asc' }
  })

  // 2. Equipment profile & maintenance/calibration history
  const eqWhere: any = { department: "XN" }
  if (filters.equipmentId && filters.equipmentId !== "ALL") {
    eqWhere.id = filters.equipmentId
  }
  const equipments = await prisma.equipment.findMany({
    where: eqWhere,
    include: {
      maintenances: {
        include: { technician: true },
        orderBy: { date: 'desc' }
      },
      calibrations: {
        orderBy: { date: 'desc' }
      }
    },
    orderBy: { name: 'asc' }
  })

  // 3. Incident and troubleshooting records (Sổ sự cố & Khắc phục)
  const incidentWhere: any = {
    status: { in: ["WARNING", "BROKEN"] },
    createdAt: { gte: startDay, lte: endDay },
    equipment: { department: "XN" }
  }
  if (filters.equipmentId && filters.equipmentId !== "ALL") {
    incidentWhere.equipmentId = filters.equipmentId
  }
  const incidents = await prisma.log.findMany({
    where: incidentWhere,
    include: {
      equipment: {
        include: {
          maintenances: {
            include: { technician: true },
            orderBy: { date: 'desc' }
          }
        }
      },
      user: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return {
    logs,
    equipments,
    incidents
  }
}
