import UsageManager from '@/components/UsageManager'
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import ReportForm from "@/components/ReportForm"
import { formatDateVN } from "@/lib/date"

export default async function ScanPage({ params }: { params: { id: string } }) {
  const cleanId = params.id.trim().replace(/\/$/, "");

  const equipment = await prisma.equipment.findFirst({
    where: {
      OR: [
        { id: cleanId },
        { code: cleanId }
      ]
    }
  })

  if (!equipment) {
    notFound()
  }

  const activeUsage = await prisma.usageLog.findFirst({
    where: { equipmentId: equipment.id, endTime: null },
    orderBy: { startTime: 'desc' }
  })
  
  const usageHistory = await prisma.usageLog.findMany({
    where: { equipmentId: equipment.id },
    orderBy: { startTime: 'desc' },
    take: 10
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-900 pb-20 pt-8 px-4 text-center shadow-md">
        <h1 className="text-lg font-black text-white uppercase tracking-wider">TTYT KHU VỰC LIÊN CHIỂU</h1>
        <p className="text-blue-100 text-xs mt-1 font-semibold uppercase tracking-widest">Khoa Xét Nghiệm</p>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-12 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 p-6">
          <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase leading-tight">{equipment.name}</h2>
              <p className="font-mono text-slate-400 dark:text-slate-500 font-bold text-xs mt-1">{equipment.code}</p>
            </div>
            <span className={"px-2.5 py-0.5 rounded-full text-[10px] font-black border " + (
              equipment.status === "WORKING" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-955/20 dark:text-green-400 dark:border-green-800" :
              equipment.status === "WARNING" ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-955/20 dark:text-yellow-400 dark:border-yellow-800" :
              "bg-red-50 text-red-700 border-red-200 dark:bg-red-955/20 dark:text-red-400 dark:border-red-800"
            )}>
              {equipment.status === "WORKING" ? "SẴN SÀNG" : equipment.status === "WARNING" ? "CẦN HIỆU CHUẨN" : "SỰ CỐ / HỎNG"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase">Khoa / Phòng</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Khoa Xét nghiệm (XN)</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase">Mức rủi ro AI</p>
              <p className={"font-black mt-0.5 " + (
                equipment.riskScore === 'HIGH' ? 'text-red-500' :
                equipment.riskScore === 'MEDIUM' ? 'text-orange-500' : 'text-blue-500'
              )}>{equipment.riskScore}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase">Model</p>
              <p className="font-extrabold text-slate-800 dark:text-slate-255 mt-0.5">{equipment.model || '--'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase">Số serial</p>
              <p className="font-bold text-slate-800 dark:text-slate-255 mt-0.5">{equipment.serialNumber || '--'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase">Hãng sản xuất</p>
              <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{equipment.brand || '--'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase">Nước sản xuất</p>
              <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{equipment.origin || '--'}</p>
            </div>
          </div>

          <div className="text-sm space-y-3">
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
              <span className="text-slate-400 text-xs font-bold uppercase">KTV hiệu chuẩn QC</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{equipment.qcTechnician || '--'}</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase">Ngày nhận / đưa vào sử dụng</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{formatDateVN(equipment.purchaseDate)}</p>
            </div>
            {equipment.contactInfo && (
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase">Liên hệ nhà phân phối / sản xuất</p>
                <p className="font-semibold text-slate-700 dark:text-slate-355 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 text-xs mt-1 leading-relaxed">{equipment.contactInfo}</p>
              </div>
            )}
            {equipment.usageNotes && (
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase">Lưu ý khi sử dụng</p>
                <p className="font-semibold text-slate-700 dark:text-slate-355 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 text-xs mt-1 leading-relaxed">{equipment.usageNotes}</p>
              </div>
            )}
          </div>
        </div>

        <ReportForm equipmentId={equipment.id} />
        
        <UsageManager
          equipmentId={equipment.id}
          initialActiveUsage={activeUsage as any}
          initialHistory={usageHistory as any}
        />
      </div>
    </div>
  );
}
