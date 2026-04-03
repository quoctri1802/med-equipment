"use server"

import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

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

  // If completed, potentially auto-update the equipment status
  if (data.status === "COMPLETED") {
    await prisma.equipment.update({
      where: { id: data.equipmentId },
      data: { status: "WORKING" }
    })
  } else if (data.status === "IN_PROGRESS" || data.status === "PENDING") {
      // If maintenance is ongoing, we might want to flag the equipment differently, but let's just make sure it's at least WARNING or BROKEN.
      // Easiest is to not force it unless specified. 
  }

  revalidatePath("/dashboard/maintenance")
  revalidatePath("/dashboard/alerts")
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

  // Auto update equipment status if marked as COMPLETED
  if (data.status === "COMPLETED" && currentSettings?.status !== "COMPLETED") {
    await prisma.equipment.update({
      where: { id: data.equipmentId || currentSettings?.equipmentId },
      data: { status: "WORKING" }
    })
  }

  revalidatePath("/dashboard/maintenance")
  revalidatePath("/dashboard/alerts")
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
  return { success: true }
}
