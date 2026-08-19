"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getDailyStatus(filters?: { status?: string, startDate?: string, endDate?: string }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Unauthorized")
  }

  const VIETNAM_OFFSET = 7;
  
  let startDay: Date;
  if (filters?.startDate) {
    startDay = new Date(`${filters.startDate}T00:00:00+07:00`);
  } else {
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

  // 1. Logs: only for XN equipment
  const whereLog: any = {
    createdAt: { 
      gte: startDay,
      lte: endDay
    },
    equipment: {
      department: "XN"
    }
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

  // 2. Missing logs: only for XN equipment
  const reportedEquipmentIds = dailyLogs.map(log => log.equipmentId)
  
  const whereMissing: any = {
    id: {
      notIn: reportedEquipmentIds
    },
    department: "XN"
  }

  if (filters?.status && filters.status !== "ALL") {
    whereMissing.status = filters.status
  }

  const missingEquipments = await prisma.equipment.findMany({
    where: whereMissing,
    orderBy: { name: 'asc' }
  })

  return {
    reported: dailyLogs,
    missing: missingEquipments
  }
}
