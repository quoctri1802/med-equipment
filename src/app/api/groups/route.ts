import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

// Default fallback groups if database is empty
const DEFAULT_GROUPS = [
  "Sinh hóa",
  "Huyết học",
  "Vi sinh",
  "Miễn dịch",
  "Giải phẫu bệnh",
  "Nước tiểu",
  "Đông máu"
]

export async function GET() {
  try {
    let groups = await prisma.equipmentGroup.findMany({
      orderBy: { name: "asc" }
    })

    // If empty, auto-seed default groups
    if (groups.length === 0) {
      await prisma.equipmentGroup.createMany({
        data: DEFAULT_GROUPS.map(name => ({ name })),
        skipDuplicates: true
      })
      groups = await prisma.equipmentGroup.findMany({
        orderBy: { name: "asc" }
      })
    }

    return NextResponse.json(groups)
  } catch (error: any) {
    console.error("Error fetching groups:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name } = await req.json()
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Tên nhóm không được bỏ trống" }, { status: 400 })
    }

    const trimmedName = name.trim()

    // Check duplicate
    const existing = await prisma.equipmentGroup.findUnique({
      where: { name: trimmedName }
    })

    if (existing) {
      return NextResponse.json({ error: "Nhóm thiết bị này đã tồn tại" }, { status: 400 })
    }

    const group = await prisma.equipmentGroup.create({
      data: { name: trimmedName }
    })

    return NextResponse.json(group, { status: 201 })
  } catch (error: any) {
    console.error("Error creating group:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing group ID" }, { status: 400 })
    }

    await prisma.equipmentGroup.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting group:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
