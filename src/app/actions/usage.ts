"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function startEquipmentUsage(data: {
  equipmentId: string
  userName: string
  purpose: string
}) {
  const session = await getServerSession(authOptions)
  
  // Ensure the equipment exists
  const eq = await prisma.equipment.findUnique({
    where: { id: data.equipmentId }
  })
  if (!eq) throw new Error("Không tìm thấy thiết bị.")

  // Check if it is currently in use
  const activeUsage = await prisma.usageLog.findFirst({
    where: {
      equipmentId: data.equipmentId,
      endTime: null
    }
  })
  if (activeUsage) {
    throw new Error(`Thiết bị đang được sử dụng bởi ${activeUsage.userName}. Vui lòng trả trước khi đăng ký mới.`)
  }

  const newLog = await prisma.usageLog.create({
    data: {
      equipmentId: data.equipmentId,
      userId: session?.user?.id || null,
      userName: data.userName,
      purpose: data.purpose,
      startTime: new Date(),
    }
  })

  revalidatePath(`/dashboard/equipment/${data.equipmentId}`)
  revalidatePath(`/scan/${data.equipmentId}`)
  revalidatePath("/dashboard")
  
  return { success: true, log: newLog }
}

export async function endEquipmentUsage(id: string, equipmentId: string) {
  const activeUsage = await prisma.usageLog.findUnique({
    where: { id }
  })
  if (!activeUsage) throw new Error("Không tìm thấy lượt sử dụng này.")

  const updatedLog = await prisma.usageLog.update({
    where: { id },
    data: {
      endTime: new Date()
    }
  })

  revalidatePath(`/dashboard/equipment/${equipmentId}`)
  revalidatePath(`/scan/${equipmentId}`)
  revalidatePath("/dashboard")

  return { success: true, log: updatedLog }
}

export async function getActiveUsage(equipmentId: string) {
  return await prisma.usageLog.findFirst({
    where: {
      equipmentId,
      endTime: null
    },
    include: {
      user: true
    }
  })
}

export async function getUsageHistory(equipmentId: string) {
  return await prisma.usageLog.findMany({
    where: { equipmentId },
    orderBy: { startTime: 'desc' },
    include: { user: true }
  })
}
