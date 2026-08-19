import UsageManager from '@/components/UsageManager'
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Wrench } from "lucide-react"
import QRCodeBox from "@/components/QRCodeBox"
import { formatDateVN, formatDateTimeVN } from "@/lib/date"

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

  const activeUsage = await prisma.usageLog.findFirst({
    where: { equipmentId: params.id, endTime: null },
    orderBy: { startTime: 'desc' }
  })
  
  const usageHistory = await prisma.usageLog.findMany({
    where: { equipmentId: params.id },
    orderBy: { startTime: 'desc' },
    take: 10
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Hồ sơ thiết bị xét nghiệm</h1>
          <p className="text-slate-500 font-mono text-sm tracking-widest">{equipment.code}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Info & QR */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg uppercase leading-tight">{equipment.name}</h3>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest mt-1 block">
                  Khoa Xét nghiệm (XN)
                </span>
              </div>
              
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                equipment.status === "WORKING" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800" :
                equipment.status === "WARNING" ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800" :
                "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800"
              }`}>
                {equipment.status === 'WORKING' ? 'SẴN SÀNG' : equipment.status === 'WARNING' ? 'CẦN HIỆU CHUẨN' : 'SỰ CỐ / HỎNG'}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-2">
                <span className="text-slate-500">Mã thiết bị</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{equipment.code}</span>
              </div>
              {equipment.testGroup && (
                <div className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-2">
                  <span className="text-slate-500">Nhóm xét nghiệm</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{equipment.testGroup}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-2">
                <span className="text-slate-500">Model</span>
                <span className="font-bold text-slate-900 dark:text-white">{equipment.model || '--'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-2">
                <span className="text-slate-500">Số serial</span>
                <span className="font-bold text-slate-900 dark:text-white">{equipment.serialNumber || '--'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-2">
                <span className="text-slate-500">Hãng sản xuất</span>
                <span className="font-bold text-slate-900 dark:text-white">{equipment.brand || '--'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-2">
                <span className="text-slate-500">Nước sản xuất</span>
                <span className="font-bold text-slate-900 dark:text-white">{equipment.origin || '--'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-2">
                <span className="text-slate-500">KTV hiệu chuẩn QC</span>
                <span className="font-bold text-slate-900 dark:text-white">{equipment.qcTechnician || '--'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-2">
                <span className="text-slate-500">Ngày nhận / đưa vào sử dụng</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatDateVN(equipment.purchaseDate)}</span>
              </div>
            </div>

            {equipment.contactInfo && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs">
                <span className="block text-slate-500 font-bold mb-1">Liên hệ nhà PP/sản xuất:</span>
                <p className="text-slate-750 dark:text-slate-350 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed font-semibold">
                  {equipment.contactInfo}
                </p>
              </div>
            )}

            {equipment.usageNotes && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs">
                <span className="block text-slate-500 font-bold mb-1">Lưu ý khi sử dụng:</span>
                <p className="text-slate-750 dark:text-slate-350 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed font-semibold">
                  {equipment.usageNotes}
                </p>
              </div>
            )}
            
            <div className="mt-8">
              <Link href={`/dashboard/equipment/${equipment.id}/edit`} className="block w-full text-center py-3 border border-slate-200 bg-slate-50 text-slate-750 rounded-2xl font-bold text-sm tracking-wider hover:bg-slate-100 transition-colors uppercase dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800">
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

          {/* Usage Manager */}
          <UsageManager
            equipmentId={equipment.id}
            initialActiveUsage={activeUsage as any}
            initialHistory={usageHistory as any}
          />
        </div>

        {/* Right column: Logs & Maintenances */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                <Wrench className="w-4 h-4 text-blue-500" /> Nhật ký Bảo trì (Maintenance)
              </h3>
            </div>
            <div className="p-5">
              {equipment.maintenances.length === 0 ? (
                <p className="text-slate-500 text-center py-8 text-sm italic">Chưa có dữ liệu bảo trì cho thiết bị này.</p>
              ) : (
                <div className="space-y-4">
                  {equipment.maintenances.map(m => (
                    <div key={m.id} className="p-4 border border-slate-150 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{m.description}</h4>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                          m.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800' :
                          m.status === 'IN_PROGRESS' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800' :
                          'bg-slate-55 text-slate-650 border-slate-200 dark:bg-slate-900 dark:text-slate-400'
                        }`}>{m.status === 'COMPLETED' ? 'HOÀN THÀNH' : m.status === 'IN_PROGRESS' ? 'ĐANG SỬA CHỮA' : 'CHỜ XỬ LÝ'}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1 mt-3 border-t border-slate-100 dark:border-slate-800/80 pt-2 font-medium">
                        <span>KTV: <span className="font-bold text-slate-700 dark:text-slate-350">{m.technician?.name || 'N/A'}</span></span>
                        <span>Chi phí: <span className="font-bold text-slate-700 dark:text-slate-350">{m.cost ? m.cost.toLocaleString() + ' đ' : '--'}</span></span>
                        <span>Ngày thực hiện: <span className="font-bold text-slate-700 dark:text-slate-350">{formatDateVN(m.date)}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 overflow-hidden">
             <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                <Clock className="w-4 h-4 text-orange-500" /> Lịch sử vận hành (Logbook)
              </h3>
            </div>
            <div className="p-5">
              {equipment.logs.length === 0 ? (
                <p className="text-slate-500 text-center py-8 text-sm italic">Chưa có báo cáo vận hành.</p>
              ) : (
                <div className="space-y-4">
                  {equipment.logs.map(log => (
                    <div key={log.id} className="p-4 border-l-4 border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20 rounded-r-2xl">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                           log.status === "WORKING" ? "text-green-600 border-green-200 bg-green-50" : 
                           log.status === "WARNING" ? "text-yellow-600 border-yellow-200 bg-yellow-50" :
                           "text-red-600 border-red-200 bg-red-50"
                        }`}>
                          {log.status === 'WORKING' ? 'SẴN SÀNG' : log.status === 'WARNING' ? 'CẦN HIỆU CHUẨN' : 'SỰ CỐ'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold italic">{formatDateTimeVN(log.createdAt)}</span>
                      </div>
                      {log.note && <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">{log.note}</p>}
                      {log.imageUrl && (
                        <div className="mt-3 rounded-2xl overflow-hidden max-w-sm border border-slate-200 dark:border-slate-700">
                          <a href={log.imageUrl} target="_blank" rel="noopener noreferrer">
                            <img src={log.imageUrl} alt="Ảnh chụp sự cố" className="w-full h-auto object-cover max-h-48 hover:opacity-90 transition-opacity" />
                          </a>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400 mt-3 font-semibold border-t border-slate-100 dark:border-slate-800/80 pt-1.5 opacity-80">Người ghi nhận: {log.reporterName || log.user?.name || log.user?.email || 'N/A'}</p>
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
