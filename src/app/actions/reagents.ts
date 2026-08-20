"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function checkAuth() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.id) {
    throw new Error("Vui lòng đăng nhập.")
  }
  return session
}

export async function addReagent(data: {
  name: string
  code: string
  lotNumber: string
  expiryDate: string
  volume: number
  unit: string
  minSafetyVolume: number
  consumptionPerSample: number
  equipmentId?: string
}) {
  const session = await checkAuth()
  const perms = session.user?.permissions?.split(',') || []
  const canEdit = session.user?.role === "ADMIN" || perms.includes("EQUIPMENT_EDIT")
  
  if (!canEdit) {
    throw new Error("Bạn không có quyền quản lý kho hóa chất.")
  }

  const reagent = await prisma.reagent.create({
    data: {
      name: data.name,
      code: data.code,
      lotNumber: data.lotNumber,
      expiryDate: new Date(data.expiryDate),
      volume: Number(data.volume),
      unit: data.unit,
      minSafetyVolume: Number(data.minSafetyVolume),
      consumptionPerSample: Number(data.consumptionPerSample),
      equipmentId: data.equipmentId || null
    }
  })

  revalidatePath("/dashboard/reagents")
  revalidatePath("/dashboard")
  return { success: true, reagent }
}

export async function deleteReagent(id: string) {
  const session = await checkAuth()
  if (session.user?.role !== "ADMIN") {
    throw new Error("Chỉ quản trị viên mới được phép xóa hóa chất khỏi hệ thống.")
  }

  await prisma.reagent.delete({
    where: { id }
  })

  revalidatePath("/dashboard/reagents")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function adjustReagentVolume(id: string, volume: number) {
  const session = await checkAuth()
  
  const updated = await prisma.reagent.update({
    where: { id },
    data: {
      volume: Number(volume)
    }
  })

  revalidatePath("/dashboard/reagents")
  revalidatePath("/dashboard")
  return { success: true, reagent: updated }
}
