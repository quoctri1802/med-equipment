import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Wrench } from "lucide-react"
import QRCodeBox from "@/components/QRCodeBox"

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
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/dashboard/equipment" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Hồ sơ thiết bị</h1>
          <p className="text-slate-500 font-mono text-sm tracking-widest">{equipment.code}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lớp thông tin & QR */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-black mb-4 uppercase tracking-tight text-blue-600 dark:text-blue-400">{equipment.name}</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-2">
                <span className="text-slate-500">Trạng thái</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                  equipment.status === "WORKING" ? "bg-green-100 text-green-700" :
                  equipment.status === "WARNING" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {equipment.status === 'WORKING' ? 'HOẠT ĐỘNG' : equipment.status === 'WARNING' ? 'CẢNH BÁO' : 'ĐANG HỎNG'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-2">
                <span className="text-slate-500">Khoa / Phòng</span>
                <span className="font-bold text-slate-900 dark:text-white">{equipment.department}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-2">
                <span className="text-slate-500">Mức độ rủi ro</span>
                <span className={`font-bold ${
                  equipment.riskScore === 'HIGH' ? 'text-red-500' :
                  equipment.riskScore === 'MEDIUM' ? 'text-orange-500' :
                  'text-slate-600'
                }`}>{equipment.riskScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngày mua</span>
                <span className="font-bold">{new Date(equipment.purchaseDate).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            
            <div className="mt-8">
              <Link href={`/dashboard/equipment/${equipment.id}/edit`} className="block w-full text-center py-2.5 border border-slate-200 bg-slate-50 text-slate-700 rounded-xl font-bold text-sm tracking-wider hover:bg-slate-100 transition-colors uppercase">
                Chỉnh sửa hồ sơ
              </Link>
            </div>
          </div>

          {/* QR Code Section */}
          <QRCodeBox 
            equipmentId={equipment.id} 
            equipmentCode={equipment.code} 
            equipmentName={equipment.name} 
          />
        </div>

        {/* Lớp nhật ký & bảo trì */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase">
                <Wrench className="w-4 h-4 text-blue-500" /> Nhật ký Bảo trì (Maintenance)
              </h3>
            </div>
            <div className="p-4">
              {equipment.maintenances.length === 0 ? (
                <p className="text-slate-500 text-center py-8 text-sm italic">Chưa có dữ liệu bảo trì cho thiết bị này.</p>
              ) : (
                <div className="space-y-4">
                  {equipment.maintenances.map(m => (
                    <div key={m.id} className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{m.description}</h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{m.status}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                        <span>KTV: <span className="font-bold">{m.technician?.name || 'N/A'}</span></span>
                        <span>Chi phí: <span className="font-bold">{m.cost ? m.cost.toLocaleString() + 'đ' : '--'}</span></span>
                        <span>Ngày thực hiện: <span className="font-bold">{new Date(m.date).toLocaleDateString('vi-VN')}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
             <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase">
                <Clock className="w-4 h-4 text-orange-500" /> Lịch sử vận hành (Logbook)
              </h3>
            </div>
            <div className="p-4">
              {equipment.logs.length === 0 ? (
                <p className="text-slate-500 text-center py-8 text-sm italic">Chưa có báo cáo vận hành.</p>
              ) : (
                <div className="space-y-4">
                  {equipment.logs.map(log => (
                    <div key={log.id} className="p-3 border-l-4 border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                           log.status === "WORKING" ? "text-green-600 border-green-200 bg-green-50" : 
                           log.status === "WARNING" ? "text-yellow-600 border-yellow-200 bg-yellow-50" :
                           "text-red-600 border-red-200 bg-red-50"
                        }`}>
                          {log.status === 'WORKING' ? 'BÌNH THƯỜNG' : log.status === 'WARNING' ? 'CẢNH BÁO' : 'BÁO HỎNG'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono italic">{new Date(log.createdAt).toLocaleString('vi-VN')}</span>
                      </div>
                      {log.note && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{log.note}</p>}
                      <p className="text-[10px] text-slate-500 mt-2 font-medium opacity-70">Người ghi nhận: {log.user?.name || log.user?.email || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
