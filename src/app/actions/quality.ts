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

export async function addCalibration(data: {
  equipmentId: string
  date: string
  expireDate: string
  organization: string
  certificateUrl?: string
  notes?: string
}) {
  const session = await checkAuth()
  const perms = session.user?.permissions?.split(',') || []
  if (session.user?.role !== "ADMIN" && !perms.includes("EQUIPMENT_EDIT")) {
    throw new Error("Bạn không có quyền cấu hình kiểm định.")
  }

  const calibration = await prisma.calibration.create({
    data: {
      equipmentId: data.equipmentId,
      date: new Date(data.date),
      expireDate: new Date(data.expireDate),
      organization: data.organization,
      certificateUrl: data.certificateUrl || null,
      notes: data.notes || null
    }
  })

  revalidatePath(`/dashboard/equipment/${data.equipmentId}`)
  revalidatePath("/dashboard")
  return { success: true, calibration }
}

export async function addQualityControl(data: {
  equipmentId: string
  type: string
  controlName: string
  lotNumber: string
  parameterName: string
  measuredValue: number
  targetValue: number
  sdValue: number
  notes?: string
}) {
  const session = await checkAuth()

  // Calculate Z-Score
  const zScore = (Number(data.measuredValue) - Number(data.targetValue)) / Number(data.sdValue)
  const absZ = Math.abs(zScore)

  let resultStatus = "PASS"
  if (absZ > 3) {
    resultStatus = "FAIL" // Westgard 1_3s violation
  } else if (absZ > 2) {
    resultStatus = "WARNING" // Westgard 1_2s warning
  }

  const qc = await prisma.qualityControl.create({
    data: {
      equipmentId: data.equipmentId,
      userId: session.user.id,
      type: data.type,
      controlName: data.controlName,
      lotNumber: data.lotNumber,
      parameterName: data.parameterName,
      measuredValue: Number(data.measuredValue),
      targetValue: Number(data.targetValue),
      sdValue: Number(data.sdValue),
      resultStatus,
      notes: data.notes || null
    }
  })

  revalidatePath(`/dashboard/equipment/${data.equipmentId}`)
  return { success: true, qc }
}

export async function addSampleRun(data: {
  equipmentId: string
  sampleCount: number
  notes?: string
}) {
  const session = await checkAuth()
  const count = parseInt(String(data.sampleCount), 10)
  if (isNaN(count) || count < 0) {
    throw new Error("Số mẫu chạy phải là số dương.")
  }

  const run = await prisma.$transaction(async (tx) => {
    const sampleRun = await tx.sampleRun.create({
      data: {
        equipmentId: data.equipmentId,
        userId: session.user.id,
        sampleCount: count,
        notes: data.notes || null
      }
    })

    await tx.equipment.update({
      where: { id: data.equipmentId },
      data: {
        totalSamples: {
          increment: count
        }
      }
    })

    return sampleRun
  })

  revalidatePath(`/dashboard/equipment/${data.equipmentId}`)
  revalidatePath("/dashboard")
  return { success: true, run }
}
