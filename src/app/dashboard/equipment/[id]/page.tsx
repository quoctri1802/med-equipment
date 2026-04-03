import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Wrench } from "lucide-react"

const prisma = new PrismaClient()

export default async function EquipmentDetailsPage({ params }: { params: { id: string } }) {
  const equipment = await prisma.equipment.findUnique({
    where: { id: params.id },
    include: {
      logs: {
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      },
      maintenances: {
        orderBy: { createdAt: 'desc' },
        include: { technician: true }
      }
    }
  })

  if (!equipment) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/dashboard/equipment" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hồ sơ thiết bị</h1>
          <p className="text-slate-500 font-mono text-sm">{equipment.code}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold mb-4">{equipment.name}</h2>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-slate-500 block mb-1">Trạng thái</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  equipment.status === "WORKING" ? "bg-green-100 text-green-700" :
                  equipment.status === "WARNING" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {equipment.status}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Khoa / Phòng</span>
                <span className="font-medium">{equipment.department}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Mức độ rủi ro</span>
                <span className="font-medium">{equipment.riskScore}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Ngày mua</span>
                <span className="font-medium">{new Date(equipment.purchaseDate).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-700 mt-6 pt-6 flex gap-2">
              <Link href={`/dashboard/equipment/${equipment.id}/edit`} className="w-full text-center py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                Chỉnh sửa
              </Link>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-500" /> Tóm tắt bảo trì
            </h3>
            {equipment.maintenances.length === 0 ? (
              <p className="text-slate-500 text-center py-4">Chưa có dữ liệu bảo trì.</p>
            ) : (
              <div className="space-y-4">
                {equipment.maintenances.map(m => (
                  <div key={m.id} className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{m.description}</h4>
                      <span className="text-xs font-medium px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-full">{m.status}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex gap-4">
                      <span>KTV: {m.technician?.name || 'N/A'}</span>
                      <span>Chi phí: {m.cost ? m.cost.toLocaleString() + 'đ' : '--'}</span>
                      <span>Ngày: {new Date(m.date).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" /> Lịch sử báo hỏng (Logs)
            </h3>
            {equipment.logs.length === 0 ? (
              <p className="text-slate-500 text-center py-4">Chưa có dữ liệu báo hỏng.</p>
            ) : (
              <div className="space-y-4">
                {equipment.logs.map(log => (
                  <div key={log.id} className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Trạng thái: {log.status}</h4>
                      <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                    {log.note && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Ghi chú: {log.note}</p>}
                    <p className="text-xs text-slate-400 mt-2">Người báo: {log.user?.name || log.user?.email || 'N/A'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
