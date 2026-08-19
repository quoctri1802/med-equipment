import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, purchaseDate, model, serialNumber, brand, origin, contactInfo, usageNotes, qcTechnician, testGroup, code: customCode } = body

    // Force department to XN (Laboratory)
    const department = "XN"

    // Generate XN-YYYYMMDD-STT string
    const dateObj = new Date(purchaseDate)
    const dateStr = dateObj.toISOString().slice(0, 10).replace(/-/g, "")
    
    // Quick random STT
    const stt = Math.floor(100 + Math.random() * 900) 
    const generatedCode = `${department}-${dateStr}-${stt}`
    const finalCode = customCode ? customCode.trim() : generatedCode

    const equipment = await prisma.equipment.create({
      data: {
        name,
        code: finalCode,
        department,
        purchaseDate: new Date(purchaseDate),
        status: "WORKING",
        riskScore: "LOW",
        model: model || null,
        serialNumber: serialNumber || null,
        brand: brand || null,
        origin: origin || null,
        contactInfo: contactInfo || null,
        usageNotes: usageNotes || null,
        qcTechnician: qcTechnician || null,
        testGroup: testGroup || null
      }
    })

    return NextResponse.json(equipment, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create equipment" }, { status: 500 })
  }
}
