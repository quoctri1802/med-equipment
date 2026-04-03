import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import { Plus } from "lucide-react"
import EquipmentList from "./EquipmentList"

const prisma = new PrismaClient()

export default async function EquipmentPage() {
  const equipments = await prisma.equipment.findMany({
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Danh sách Thiết bị</h1>
          <p className="text-slate-500 dark:text-slate-400">Quản lý toàn bộ thiết bị y tế</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/equipment/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 text-blue-100" />
            Thêm thiết bị
          </Link>
        </div>
      </div>

      <EquipmentList initialEquipments={equipments.map(e => ({
        ...e,
        createdAt: e.createdAt // Keep as Date
      }))} />
    </div>
  )
}
