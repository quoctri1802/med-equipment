"use server"

import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

export async function submitScanReport(data: { equipmentId: string, status: string, note: string }) {
  // Try to get session, if unauthenticated, we'll try to find an admin or staff user to assign it to 
  // since scanning could potentially be done on a public tablet (depending on client requirement).
  // But ideally, requires session.
  const session = await getServerSession(authOptions)
  
  let userId = session?.user?.id
  
  if (!userId) {
    // Fallback for MVP if scanning happens without login
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (adminUser) userId = adminUser.id
    else throw new Error("Chưa đăng nhập và không tìm thấy User mặc định hệ thống.")
  }

  // 1. Update the Equipment Status
  await prisma.equipment.update({
    where: { id: data.equipmentId },
    data: { status: data.status }
  })

  // 2. Create the Log entry
  const newLog = await prisma.log.create({
    data: {
      equipmentId: data.equipmentId,
      userId: userId as string,
      status: data.status,
      note: data.note || "Cập nhật qua quét QR Hệ thống."
    }
  })

  revalidatePath("/")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/alerts")
  revalidatePath(`/scan/${data.equipmentId}`)
  
  return { success: true, log: newLog }
}
