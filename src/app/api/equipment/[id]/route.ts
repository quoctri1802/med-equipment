import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id: params.id }
    })
    
    if (!equipment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(equipment)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
