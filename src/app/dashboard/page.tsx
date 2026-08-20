import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { FlaskConical, ShieldAlert, CheckCircle2, Wrench, ClipboardList, Clock, Sparkles } from "lucide-react"
import { StatusPieChart, RiskBarChart } from "@/components/DashboardCharts"
import Link from "next/link"
import { formatDateTimeVN } from '@/lib/date'

import prisma from "@/lib/prisma"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  // Tối ưu hóa tốc độ hệ thống: Truy vấn song song (Parallel Database Queries)
  const [
    totalEquipments,
    brokenEquipments,
    workingEquipments,
    pendingMaintenance,
    equipmentStatusCountsRaw,
    equipmentByRiskRaw,
    recentMaintenances,
    recentLogs,
    equipmentByGroupRaw,
    reagentsRaw
  ] = await Promise.all([
    prisma.equipment.count({ where: { department: "XN" } }),
    prisma.equipment.count({ where: { status: "BROKEN", department: "XN" } }),
    prisma.equipment.count({ where: { status: "WORKING", department: "XN" } }),
    prisma.maintenance.count({ where: { status: "PENDING", equipment: { department: "XN" } } }),
    prisma.equipment.groupBy({
      by: ['status'],
      where: { department: "XN" },
      _count: { status: true }
    }),
    prisma.equipment.groupBy({
      by: ['riskScore'],
      where: { department: "XN" },
      _count: { riskScore: true }
    }),
    prisma.maintenance.findMany({
      take: 5,
      where: { equipment: { department: "XN" } },
      orderBy: { createdAt: 'desc' },
      include: { equipment: true, technician: true }
    }),
    prisma.log.findMany({
      take: 5,
      where: { equipment: { department: "XN" } },
      orderBy: { createdAt: 'desc' },
      include: { equipment: true, user: true }
    }),
    prisma.equipment.groupBy({
      by: ['testGroup'],
      where: { department: "XN" },
      _count: { id: true }
    }),
    prisma.reagent.findMany()
  ])

  // Map status labels
  const statusLabels: Record<string, string> = {
    WORKING: "Sẵn sàng",
    WARNING: "Cần hiệu chuẩn",
    BROKEN: "Sự cố / Hỏng"
  }
  
  const equipmentStatusCounts = equipmentStatusCountsRaw.map(item => ({
    status: statusLabels[item.status] || item.status,
    _count: item._count
  }))

  const equipmentByGroup = equipmentByGroupRaw.map(item => ({
    name: item.testGroup || "Chưa phân nhóm",
    _count: item._count.id
  })).sort((a, b) => b._count - a._count)

  const criticalReagentsCount = reagentsRaw.filter(r => {
    const daysDiff = Math.ceil((new Date(r.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return r.volume <= r.minSafetyVolume || daysDiff <= 30
  }).length

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-indigo-950 p-8 rounded-3xl text-white shadow-xl border border-white/5">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
              Khoa Xét Nghiệm
            </span>
            <h1 className="text-3xl font-black tracking-tight">Hệ thống Giám sát & Quản lý Máy Xét nghiệm</h1>
            <p className="text-blue-200 text-sm mt-1.5 opacity-90">Chào mừng trở lại, <span className="font-bold text-white">{session?.user?.name || session?.user?.email}</span></p>
          </div>

        </div>
      </div>

      {/* Reagent Warning Banner */}
      {criticalReagentsCount > 0 && (
        <div className="bg-red-50 border border-red-150 dark:bg-red-950/20 dark:border-red-900/30 p-4 px-5 rounded-3xl flex items-center justify-between text-xs font-semibold text-red-800 dark:text-red-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping shrink-0" />
            <span>Có <strong>{criticalReagentsCount}</strong> hóa chất/vật tư tiêu hao sắp hết hạn hoặc tồn kho dưới mức an toàn!</span>
          </div>
          <Link href="/dashboard/reagents" className="underline hover:text-red-900 dark:hover:text-red-300 font-extrabold uppercase shrink-0">
            Kiểm tra ngay
          </Link>
        </div>
      )}

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="group bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 flex items-center gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/20 dark:hover:border-blue-500/20">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl dark:bg-blue-900/20 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <FlaskConical className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Tổng thiết bị</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums leading-none">{totalEquipments}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="group bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 flex items-center gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/20 dark:hover:border-emerald-500/20">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl dark:bg-emerald-900/20 dark:text-emerald-400 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Sẵn sàng / Vận hành</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums leading-none">{workingEquipments}</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="group bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 flex items-center gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/5 hover:border-red-500/20 dark:hover:border-red-500/20">
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl dark:bg-red-900/20 dark:text-red-400 group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Sự cố / Hỏng</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums leading-none">{brokenEquipments}</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="group bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 flex items-center gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5 hover:border-amber-500/20 dark:hover:border-amber-500/20">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl dark:bg-amber-900/20 dark:text-amber-400 group-hover:scale-110 transition-transform">
            <Wrench className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Bảo trì / Hiệu chuẩn</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums leading-none">{pendingMaintenance}</p>
          </div>
        </div>
      </div>
      
      {/* Charts & Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-150 dark:border-slate-700/50">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-sm uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" /> Trạng thái hoạt động
          </h3>
          <StatusPieChart data={equipmentStatusCounts} />
        </div>

        {/* Risk Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-150 dark:border-slate-700/50">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-sm uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" /> Mức độ rủi ro thiết bị
          </h3>
          <RiskBarChart data={equipmentByRiskRaw} />
        </div>

        {/* Equipment Groups distribution */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-150 dark:border-slate-700/50 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> Nhóm thiết bị xét nghiệm
            </h3>
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
              {equipmentByGroup.map((group) => {
                const percentage = totalEquipments > 0 ? (group._count / totalEquipments) * 100 : 0;
                return (
                  <div key={group.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>{group.name}</span>
                      <span className="tabular-nums">{group._count} máy ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
                            {equipmentByGroup.length === 0 && (
                <div className="text-center py-8 text-slate-450 dark:text-slate-500 text-sm">Chưa có thiết bị nào được gán nhóm</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Maintenances */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-150 dark:border-slate-700/50 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
              <Wrench className="w-4 h-4 text-blue-500" /> Yêu cầu bảo trì gần đây
            </h3>
            <Link href="/dashboard/maintenance" className="text-xs text-blue-600 hover:underline font-bold">
              Tất cả
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentMaintenances.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">Chưa có yêu cầu nào</div>
            ) : (
              recentMaintenances.map(m => (
                <div key={m.id} className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-700/10 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase">{m.equipment.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{m.description}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                      m.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800' :
                      m.status === 'IN_PROGRESS' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800' : 
                      'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-950/20 dark:text-slate-400 dark:border-slate-800'
                    }`}>
                      {m.status === 'COMPLETED' ? 'HOÀN THÀNH' : m.status === 'IN_PROGRESS' ? 'ĐANG SỬA CHỮA' : 'CHỜ XỬ LÝ'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Logs (Activity) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-150 dark:border-slate-700/50 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
              <ClipboardList className="w-4 h-4 text-orange-500" /> Nhật ký vận hành (Logs)
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">Chưa có nhật ký nào</div>
            ) : (
              recentLogs.map(log => (
                <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/10 transition-colors">
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl">
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      <span className="font-bold">{log.user?.name || log.user?.email}</span> cập nhật <span className="text-blue-600 dark:text-blue-400 font-bold uppercase">{log.equipment.name}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        log.status === "WORKING" ? "text-green-600 border-green-200 bg-green-50" : 
                        log.status === "WARNING" ? "text-yellow-600 border-yellow-200 bg-yellow-50" :
                        "text-red-600 border-red-200 bg-red-50"
                      }`}>
                        {log.status === 'WORKING' ? 'SẴN SÀNG' : log.status === 'WARNING' ? 'CẦN HIỆU CHUẨN' : 'SỰ CỐ'}
                      </span>
                      <span className="text-[10px] text-slate-400 italic">
                        {formatDateTimeVN(log.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
