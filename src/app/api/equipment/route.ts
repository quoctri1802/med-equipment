import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, department, purchaseDate } = body

    // Generate KHOA-YYYYMMDD-STT string
    const dateObj = new Date(purchaseDate)
    const dateStr = dateObj.toISOString().slice(0, 10).replace(/-/g, "")
    
    // Quick random STT for MVP (in production use sequence)
    const stt = Math.floor(100 + Math.random() * 900) 
    const code = `${department}-${dateStr}-${stt}`

    const equipment = await prisma.equipment.create({
      data: {
        name,
        code,
        department,
        purchaseDate: new Date(purchaseDate),
        status: "WORKING",
        riskScore: "LOW"
      }
    })

    return NextResponse.json(equipment, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create equipment" }, { status: 500 })
  }
}
