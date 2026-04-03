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
    department: data.department,
    status: data.status,
    riskScore: data.riskScore
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
    throw new Error("Bạn không có quyền xoá thiết bị.")
  }

  // Đầu tiên cần xoá lịch sử logs và bảo trì liên quan đến thiết bị này (nếu có cascades thì Prisma tự làm, nhưng Sqlite cần check schema.prisma).
  // Vì trong schema The equipment and user are standard relations, we should delete them manually first just in case to avoid foreign key constraints.
  await prisma.log.deleteMany({
    where: { equipmentId: id }
  })
  
  await prisma.maintenance.deleteMany({
    where: { equipmentId: id }
  })

  await prisma.equipment.delete({
    where: { id }
  })

  revalidatePath("/dashboard/equipment")
  revalidatePath("/dashboard")
  return { success: true }
}
