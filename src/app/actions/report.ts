"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function submitScanReport(
  equipmentId: string,
  data: { status: string; note: string; reporterName: string; photoUrl?: string | null }
) {
  // Try to get session, if unauthenticated, try to find an admin user to assign it to
  const session = await getServerSession(authOptions)
  
  let userId = session?.user?.id
  
  if (!userId) {
    // Fallback if scanning happens without login
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (adminUser) userId = adminUser.id
    else throw new Error("Chưa đăng nhập và không tìm thấy User mặc định hệ thống.")
  }

  // 1. Update the Equipment Status
  await prisma.equipment.update({
    where: { id: equipmentId },
    data: { status: data.status }
  })

  // 2. Create the Log entry
  const newLog = await prisma.log.create({
    data: {
      equipmentId: equipmentId,
      userId: userId,
      status: data.status,
      reporterName: data.reporterName,
      note: data.note || "Cập nhật qua quét QR Hệ thống.",
      imageUrl: data.photoUrl || null
    }
  })

  revalidatePath("/")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/alerts")
  revalidatePath(`/scan/${equipmentId}`)
  
  return { success: true, log: newLog }
}
