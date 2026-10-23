"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getLiquidations() {
  try {
    const liquidations = await prisma.liquidation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            code: true,
            model: true,
            serialNumber: true,
            brand: true,
            origin: true,
            status: true,
            purchaseDate: true,
            department: true,
            testGroup: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    return { success: true, liquidations }
  } catch (err: any) {
    console.error("Lỗi khi lấy danh sách thanh lý:", err)
    return { success: false, error: err.message, liquidations: [] }
  }
}

export async function getEquipmentsForLiquidation() {
  try {
    // Lấy tất cả thiết bị chưa thanh lý hoàn tất (hoặc ưu tiên BROKEN/WARNING)
    const equipments = await prisma.equipment.findMany({
      where: {
        status: {
          not: "LIQUIDATED"
        }
      },
      orderBy: [
        { status: "asc" },
        { name: "asc" }
      ],
      select: {
        id: true,
        name: true,
        code: true,
        model: true,
        serialNumber: true,
        brand: true,
        purchaseDate: true,
        status: true
      }
    })
    return { success: true, equipments }
  } catch (err: any) {
    return { success: false, error: err.message, equipments: [] }
  }
}

export async function createLiquidation(data: {
  equipmentId: string
  liquidationCode?: string
  decisionNumber?: string
  reason: string
  method: string
  status?: string
  councilMembers?: string
  estimatedValue?: number
  recoveryValue?: number
  documentUrl?: string
  notes?: string
}) {
  try {
    const session = await getServerSession(authOptions)
    
    // Tự động sinh mã thanh lý nếu không có
    let code = data.liquidationCode?.trim()
    if (!code) {
      const now = new Date()
      const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, "")
      const countToday = await prisma.liquidation.count({
        where: {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
          }
        }
      })
      code = `TL-${yyyymmdd}-${String(countToday + 1).padStart(3, "0")}`
    }

    const initialStatus = data.status || "PENDING"

    const liquidation = await prisma.liquidation.create({
      data: {
        equipmentId: data.equipmentId,
        liquidationCode: code,
        decisionNumber: data.decisionNumber?.trim() || null,
        reason: data.reason.trim(),
        method: data.method,
        status: initialStatus,
        councilMembers: data.councilMembers?.trim() || null,
        estimatedValue: data.estimatedValue ? Number(data.estimatedValue) : null,
        recoveryValue: data.recoveryValue ? Number(data.recoveryValue) : null,
        documentUrl: data.documentUrl?.trim() || null,
        notes: data.notes?.trim() || null,
        createdById: session?.user?.id || null,
        approvedDate: initialStatus === "APPROVED" || initialStatus === "COMPLETED" ? new Date() : null,
        completedDate: initialStatus === "COMPLETED" ? new Date() : null,
      }
    })

    // Cập nhật trạng thái của thiết bị
    const newEquipmentStatus = initialStatus === "COMPLETED" ? "LIQUIDATED" : "PENDING_LIQUIDATION"
    await prisma.equipment.update({
      where: { id: data.equipmentId },
      data: { status: newEquipmentStatus }
    })

    // Ghi log lịch sử thiết bị
    if (session?.user?.id) {
      await prisma.log.create({
        data: {
          equipmentId: data.equipmentId,
          userId: session.user.id,
          status: newEquipmentStatus,
          reporterName: session.user.name || "Hội đồng thanh lý",
          note: `[THANH LÝ] Lập biên bản đề xuất thanh lý mã ${code}. Lý do: ${data.reason}. Hình thức: ${data.method}. Trạng thái: ${initialStatus}`
        }
      })
    }

    revalidatePath("/dashboard/liquidation")
    revalidatePath("/dashboard/equipment")
    revalidatePath(`/dashboard/equipment/${data.equipmentId}`)
    revalidatePath(`/scan/${data.equipmentId}`)

    return { success: true, liquidation }
  } catch (err: any) {
    console.error("Lỗi tạo biên bản thanh lý:", err)
    return { success: false, error: err.message || "Không thể tạo biên bản thanh lý." }
  }
}

export async function updateLiquidationStatus(
  id: string,
  status: "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED",
  extraData?: {
    recoveryValue?: number
    decisionNumber?: string
    councilMembers?: string
    notes?: string
  }
) {
  try {
    const session = await getServerSession(authOptions)

    const existing = await prisma.liquidation.findUnique({
      where: { id },
      include: { equipment: true }
    })

    if (!existing) {
      return { success: false, error: "Không tìm thấy hồ sơ thanh lý." }
    }

    const updatePayload: any = {
      status,
      notes: extraData?.notes !== undefined ? extraData.notes : existing.notes
    }

    if (extraData?.recoveryValue !== undefined) {
      updatePayload.recoveryValue = Number(extraData.recoveryValue)
    }
    if (extraData?.decisionNumber) {
      updatePayload.decisionNumber = extraData.decisionNumber
    }
    if (extraData?.councilMembers) {
      updatePayload.councilMembers = extraData.councilMembers
    }

    if (status === "APPROVED") {
      updatePayload.approvedDate = new Date()
    } else if (status === "COMPLETED") {
      updatePayload.completedDate = new Date()
      if (!existing.approvedDate) {
        updatePayload.approvedDate = new Date()
      }
    }

    const updated = await prisma.liquidation.update({
      where: { id },
      data: updatePayload
    })

    // Cập nhật trạng thái Equipment tương ứng
    let newEquipmentStatus = existing.equipment.status
    if (status === "COMPLETED") {
      newEquipmentStatus = "LIQUIDATED"
    } else if (status === "APPROVED" || status === "PENDING") {
      newEquipmentStatus = "PENDING_LIQUIDATION"
    } else if (status === "REJECTED") {
      // Hủy thanh lý thì hoàn trả về trạng thái BROKEN hoặc WORKING
      newEquipmentStatus = "BROKEN"
    }

    await prisma.equipment.update({
      where: { id: existing.equipmentId },
      data: { status: newEquipmentStatus }
    })

    // Ghi log
    if (session?.user?.id) {
      await prisma.log.create({
        data: {
          equipmentId: existing.equipmentId,
          userId: session.user.id,
          status: newEquipmentStatus,
          reporterName: session.user.name || "Hội đồng thanh lý",
          note: `[THANH LÝ] Cập nhật hồ sơ ${existing.liquidationCode} sang trạng thái: ${status}`
        }
      })
    }

    revalidatePath("/dashboard/liquidation")
    revalidatePath("/dashboard/equipment")
    revalidatePath(`/dashboard/equipment/${existing.equipmentId}`)
    revalidatePath(`/scan/${existing.equipmentId}`)

    return { success: true, liquidation: updated }
  } catch (err: any) {
    console.error("Lỗi cập nhật hồ sơ thanh lý:", err)
    return { success: false, error: err.message || "Không thể cập nhật hồ sơ thanh lý." }
  }
}

export async function deleteLiquidation(id: string) {
  try {
    const existing = await prisma.liquidation.findUnique({
      where: { id }
    })

    if (!existing) {
      return { success: false, error: "Hồ sơ không tồn tại." }
    }

    await prisma.liquidation.delete({
      where: { id }
    })

    // Khôi phục trạng thái thiết bị nếu đang ở trạng thái thanh lý
    const equipment = await prisma.equipment.findUnique({
      where: { id: existing.equipmentId }
    })

    if (equipment && (equipment.status === "PENDING_LIQUIDATION" || equipment.status === "LIQUIDATED")) {
      await prisma.equipment.update({
        where: { id: existing.equipmentId },
        data: { status: "BROKEN" }
      })
    }

    revalidatePath("/dashboard/liquidation")
    revalidatePath("/dashboard/equipment")

    return { success: true }
  } catch (err: any) {
    console.error("Lỗi xóa hồ sơ thanh lý:", err)
    return { success: false, error: err.message || "Không thể xóa hồ sơ thanh lý." }
  }
}
