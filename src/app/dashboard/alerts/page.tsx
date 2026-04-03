import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ShieldAlert, AlertTriangle, Activity, Sparkles } from "lucide-react"
import Link from "next/link"
import AIPredictionCard from "@/components/AIPredictionCard"

const prisma = new PrismaClient()

export default async function AlertsAIPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Truy cập bị từ chối</h2>
        <p className="text-slate-500 max-w-md mt-2">Chỉ có Quản trị viên mới có thể xem Cảnh báo và báo cáo phân tích AI.</p>
        <Link href="/dashboard" className="mt-6 bg-blue-600 text-white px-4 py-2 rounded">
          Quay lại tổng quan
        </Link>
      </div>
    )
  }

  // Fetch broken and warning equipments
  const urgentEquipments = await prisma.equipment.findMany({
    where: {
      status: { in: ["BROKEN", "WARNING"] }
    },
    orderBy: { riskScore: 'desc' }
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-600" /> Cảnh báo & Trí tuệ Nhân tạo
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Giám sát rủi ro tự động và dự đoán lịch trình bảo trì máy móc.
        </p>
      </div>

      {/* AI Prediction Notice (Client Component) */}
      <AIPredictionCard />

      {/* Real Alerts from DB */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-slate-500" /> 
          Cảnh báo hệ thống thời gian thực
        </h3>
        
        {urgentEquipments.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-slate-600 font-medium">Hệ thống đang hoạt động an toàn, không có thiết bị hỏng hóc.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {urgentEquipments.map((eq) => (
              <div key={eq.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className={`p-3 rounded-full ${eq.status === 'BROKEN' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30'}`}>
                  {eq.status === 'BROKEN' ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white">{eq.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Mã: {eq.code} • Khoa: {eq.department}</p>
                  <p className="text-sm font-medium mt-1 mt-2">
                    Mức độ nguy hiểm: <span className={eq.riskScore === 'HIGH' ? 'text-red-500' : 'text-yellow-600'}>{eq.riskScore}</span>
                  </p>
                </div>
                <button className="w-full sm:w-auto px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                  Xử lý ngay
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
