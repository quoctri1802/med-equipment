"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Chặn kiểm tra đăng nhập
async function checkAuth() {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Vui lòng đăng nhập.")
  }
  return session
}

export async function updateEquipment(id: string, data: any) {
  const session = await checkAuth()
  const perms = session.user?.permissions?.split(',') || []
  if (session.user?.role !== "ADMIN" && !perms.includes("EQUIPMENT_EDIT")) {
    throw new Error("Bạn không có quyền sửa thiết bị.")
  }

  const updateData: any = {
    name: data.name,
    code: data.code,
    department: data.department,
    status: data.status,
    riskScore: data.riskScore,
    model: data.model || null,
    serialNumber: data.serialNumber || null,
    brand: data.brand || null,
    origin: data.origin || null,
    contactInfo: data.contactInfo || null,
    usageNotes: data.usageNotes || null,
    qcTechnician: data.qcTechnician || null
  }

  if (data.purchaseDate) {
    updateData.purchaseDate = new Date(data.purchaseDate)
  }

  await prisma.equipment.update({
    where: { id },
    data: updateData
  })

  revalidatePath("/dashboard/equipment")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteEquipment(id: string) {
  const session = await checkAuth()
  const perms = session.user?.permissions?.split(',') || []
  if (session.user?.role !== "ADMIN" && !perms.includes("EQUIPMENT_EDIT")) {
    throw new Error("Bạn không có quyền xóa thiết bị.")
  }

  // Đầu tiên cần xóa lịch sử logs và bảo trì liên quan đến thiết bị này
  await prisma.log.deleteMany({
    where: { equipmentId: id }
  })
  
  await prisma.maintenance.deleteMany({
    where: { equipmentId: id }
  })

  await prisma.usageLog.deleteMany({
    where: { equipmentId: id }
  })

  await prisma.equipment.delete({
    where: { id }
  })

  revalidatePath("/dashboard/equipment")
  revalidatePath("/dashboard")
  return { success: true }
}
