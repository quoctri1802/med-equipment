import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { Activity, ShieldAlert, CheckCircle2, Wrench, ClipboardList, Clock } from "lucide-react"
import { StatusPieChart, DepartmentBarChart } from "@/components/DashboardCharts"
import Link from "next/link"

const prisma = new PrismaClient()

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  // Basic Stats
  const totalEquipments = await prisma.equipment.count()
  const brokenEquipments = await prisma.equipment.count({ where: { status: "BROKEN" } })
  const workingEquipments = await prisma.equipment.count({ where: { status: "WORKING" } })
  const pendingMaintenance = await prisma.maintenance.count({ where: { status: "PENDING" } })

  // Data for Charts
  const equipmentStatusCounts = await prisma.equipment.groupBy({
    by: ['status'],
    _count: { status: true }
  })
  
  const equipmentByDepartment = await prisma.equipment.groupBy({
    by: ['department'],
    _count: { department: true }
  })

  // Recent Maintenances
  const recentMaintenances = await prisma.maintenance.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { equipment: true, technician: true }
  })

  // Recent Logs (Reporting)
  const recentLogs = await prisma.log.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { equipment: true, user: true }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tổng quan hệ thống</h1>
          <p className="text-slate-500 dark:text-slate-400">Chào mừng {session?.user?.name || session?.user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex items-center gap-5 hover:scale-[1.02] transition-transform duration-300">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl dark:bg-blue-900/20 dark:text-blue-400">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Tổng thiết bị</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{totalEquipments}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex items-center gap-5 hover:scale-[1.02] transition-transform duration-300">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl dark:bg-emerald-900/20 dark:text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Đang hoạt động</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{workingEquipments}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex items-center gap-5 hover:scale-[1.02] transition-transform duration-300">
          <div className="p-4 bg-red-50 text-red-600 rounded-3xl dark:bg-red-900/20 dark:text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Đang báo hỏng</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{brokenEquipments}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex items-center gap-5 hover:scale-[1.02] transition-transform duration-300">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-3xl dark:bg-amber-900/20 dark:text-amber-400">
            <Wrench className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Bảo trì mới</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{pendingMaintenance}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">Trạng thái thiết bị</h3>
          <StatusPieChart data={equipmentStatusCounts} />
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">Phân bổ theo Khoa/Phòng</h3>
          <DepartmentBarChart data={equipmentByDepartment} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Maintenances */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <Wrench className="w-4 h-4 text-blue-500" /> Bảo trì gần đây
            </h3>
            <Link href="/dashboard/maintenance" className="text-xs text-blue-600 hover:underline font-medium">
              Tất cả
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {recentMaintenances.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">Chưa có hoạt động</div>
            ) : (
              recentMaintenances.map(m => (
                <div key={m.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase">{m.equipment.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{m.description}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      m.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Logs (Activity) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <ClipboardList className="w-4 h-4 text-orange-500" /> Nhật ký báo cáo (Logs)
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {recentLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">Chưa có báo cáo nào</div>
            ) : (
              recentLogs.map(log => (
                <div key={log.id} className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      <span className="font-bold">{log.user?.name || log.user?.email}</span> cập nhật <span className="text-blue-600 dark:text-blue-400 font-bold uppercase">{log.equipment.code}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        log.status === "WORKING" ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"
                      }`}>
                        {log.status === 'WORKING' ? 'BÌNH THƯỜNG' : 'BÁO HỎNG'}
                      </span>
                      <span className="text-[10px] text-slate-400 italic">
                        {new Date(log.createdAt).toLocaleTimeString('vi-VN')}
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
