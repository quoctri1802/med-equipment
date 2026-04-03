import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import ReportForm from "@/components/ReportForm"

export default async function ScanPage({ params }: { params: { id: string } }) {
  const equipment = await prisma.equipment.findUnique({
    where: { id: params.id }
  })

  if (!equipment) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
      <div className="bg-blue-600 pb-20 pt-8 px-4 text-center">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider">TTYT Liên Chiểu</h1>
        <p className="text-blue-100 text-sm mt-1">Cổng nộp báo cáo thiết bị y tế</p>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-12 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{equipment.name}</h2>
              <p className="font-mono text-slate-500 text-sm mt-1">{equipment.code}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              equipment.status === "WORKING" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
              equipment.status === "WARNING" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}>
              {equipment.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-2">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Khoa / Phòng</p>
              <p className="font-medium text-slate-900 dark:text-white">{equipment.department}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Đánh giá rủi ro AI</p>
              <p className="font-medium text-slate-900 dark:text-white">{equipment.riskScore}</p>
            </div>
          </div>
        </div>

        <ReportForm equipmentId={equipment.id} />
      </div>
    </div>
  )
}
