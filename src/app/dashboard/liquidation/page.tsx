import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import LiquidationManager from "@/components/LiquidationManager"

export const metadata = {
  title: "Quản lý thanh lý thiết bị | TTYT Liên Chiểu",
  description: "Module quản lý hồ sơ kiểm tra kỹ thuật và thanh lý trang thiết bị y tế"
}

export default async function LiquidationPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Lấy toàn bộ danh sách thanh lý
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

  // Lấy các thiết bị để chọn thanh lý
  const availableEquipments = await prisma.equipment.findMany({
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
      status: true
    }
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <LiquidationManager
        initialLiquidations={liquidations as any}
        availableEquipments={availableEquipments as any}
        userRole={session.user?.role}
      />
    </div>
  )
}
