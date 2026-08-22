/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function checkAuth() {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Vui lòng đăng nhập.")
  }
  return session
}

export async function createMaintenance(data: { equipmentId: string, technicianId: string, description: string, cost?: number, status: string, date: string }) {
  const session = await checkAuth()
  const perms = session.user?.permissions?.split(',') || []
  if (session.user?.role !== "ADMIN" && !perms.includes("MAINTENANCE_MANAGE")) {
    throw new Error("Bạn không có quyền quản lý bảo trì.")
  }
  
  // Create the record
  const newRecord = await prisma.maintenance.create({
    data: {
      equipmentId: data.equipmentId,
      technicianId: data.technicianId,
      description: data.description,
      cost: data.cost ? Number(data.cost) : null,
      status: data.status,
      date: new Date(data.date)
    }
  })

  // Chỉ khi xác nhận nghiệm thu (VERIFIED), thiết bị mới trở lại trạng thái hoạt động bình thường (WORKING)
  if (data.status === "VERIFIED") {
    await prisma.equipment.update({
      where: { id: data.equipmentId },
      data: { status: "WORKING" }
    })
  }

  revalidatePath("/dashboard/maintenance")
  revalidatePath("/dashboard/alerts")
  revalidatePath("/dashboard")
  return { success: true, record: newRecord }
}

export async function updateMaintenance(id: string, data: { equipmentId?: string, technicianId?: string, description?: string, cost?: number, status?: string, date?: string }) {
  const session = await checkAuth()
  const perms = session.user?.permissions?.split(',') || []
  if (session.user?.role !== "ADMIN" && !perms.includes("MAINTENANCE_MANAGE")) {
    throw new Error("Bạn không có quyền quản lý bảo trì.")
  }

  const currentSettings = await prisma.maintenance.findUnique({ where: { id } })
  
  const updateData: any = { ...data }
  if (data.date) updateData.date = new Date(data.date)
  if (data.cost !== undefined) updateData.cost = data.cost ? Number(data.cost) : null

  await prisma.maintenance.update({
    where: { id },
    data: updateData
  })

  // Chỉ khi xác nhận nghiệm thu (VERIFIED), thiết bị mới trở lại trạng thái hoạt động bình thường (WORKING)
  if (data.status === "VERIFIED" && currentSettings?.status !== "VERIFIED") {
    await prisma.equipment.update({
      where: { id: data.equipmentId || currentSettings?.equipmentId },
      data: { status: "WORKING" }
    })
  }

  revalidatePath("/dashboard/maintenance")
  revalidatePath("/dashboard/alerts")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function verifyMaintenance(id: string) {
  const session = await checkAuth()
  if (session.user?.role !== "ADMIN") {
    throw new Error("Chỉ quản trị viên mới có quyền xác nhận nghiệm thu bảo trì.")
  }

  const record = await prisma.maintenance.findUnique({ where: { id } })
  if (!record) {
    throw new Error("Không tìm thấy phiếu bảo trì.")
  }

  // Cập nhật trạng thái phiếu bảo trì thành VERIFIED
  await prisma.maintenance.update({
    where: { id },
    data: { status: "VERIFIED" }
  })

  // Cập nhật trạng thái thiết bị thành WORKING
  await prisma.equipment.update({
    where: { id: record.equipmentId },
    data: { status: "WORKING" }
  })

  revalidatePath("/dashboard/maintenance")
  revalidatePath("/dashboard/alerts")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteMaintenance(id: string) {
  const session = await checkAuth()
  const perms = session.user?.permissions?.split(',') || []
  if (session.user?.role !== "ADMIN" && !perms.includes("MAINTENANCE_MANAGE")) {
    throw new Error("Bạn không có quyền xoá phiếu bảo trì.")
  }

  await prisma.maintenance.delete({
    where: { id }
  })

  revalidatePath("/dashboard/maintenance")
  revalidatePath("/dashboard/alerts")
  revalidatePath("/dashboard")
  return { success: true }
}
