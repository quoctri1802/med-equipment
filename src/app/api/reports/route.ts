import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { equipmentId, status, note, userId } = body

    // Create log
    await prisma.log.create({
      data: {
        equipmentId,
        userId: userId || "anonymous-staff", // If no auth available for simple QR scan
        status,
        note
      }
    })

    // Update equipment status based on log
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: { status }
    })

    // Failure Logic
    if (status === "BROKEN") {
      // In a real app we'd trigger Nodemailer here to send email.
      // e.g., await sendBrokenAlertEmail(equipmentId, note)
      console.log(`[ALERT] EQUIPMENT BROKEN: ${equipmentId}`)
      
      // Also update RiskScore to HIGH
      await prisma.equipment.update({
        where: { id: equipmentId },
        data: { riskScore: "HIGH" }
      })
    } else if (status === "WARNING") {
      // Very simple AI/logic wrapper for Risk Score: 
      // Count warnings in last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const recentWarnings = await prisma.log.count({
        where: {
          equipmentId,
          status: "WARNING",
          createdAt: { gte: sevenDaysAgo }
        }
      })

      if (recentWarnings >= 2) {
        await prisma.equipment.update({
          where: { id: equipmentId },
          data: { riskScore: "HIGH" }
        })
      } else {
        await prisma.equipment.update({
          where: { id: equipmentId },
          data: { riskScore: "MEDIUM" }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 })
  }
}
