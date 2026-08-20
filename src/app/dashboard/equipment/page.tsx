import Link from "next/link"
import { Plus } from "lucide-react"
import EquipmentList from "./EquipmentList"

import prisma from "@/lib/prisma"

export default async function EquipmentPage() {
  // Lọc chỉ lấy thiết bị Khoa Xét nghiệm
  const equipments = await prisma.equipment.findMany({
    where: { department: "XN" },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Danh sách Thiết bị Xét nghiệm</h1>
          <p className="text-slate-500 dark:text-slate-400">Quản lý toàn bộ thiết bị chuyên môn khoa xét nghiệm</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/equipment/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-5 h-5 text-blue-100" />
            Thêm thiết bị
          </Link>
        </div>
      </div>

      <EquipmentList initialEquipments={equipments.map(e => ({
        ...e,
        createdAt: e.createdAt
      }))} />
    </div>
  )
}
