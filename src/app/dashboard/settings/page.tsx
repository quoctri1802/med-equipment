import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Settings, ShieldAlert, BadgeInfo, Bell } from "lucide-react"
import UserManagement from "@/components/UserManagement"

const prisma = new PrismaClient()

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Truy cập bị từ chối</h2>
        <p className="text-slate-500 mt-2">Chỉ Quản trị viên hệ thống (Admin) mới có quyền truy cập trang Cài đặt.</p>
      </div>
    )
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-600 dark:text-slate-400" /> Cài đặt Hệ thống
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Quản lý tài khoản và các cấu hình chung của hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Management Section */}
        <div className="lg:col-span-2">
          <UserManagement initialUsers={users} />
        </div>

        {/* System Settings Side Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
            <h3 className="font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3 text-slate-900 dark:text-white">
              <BadgeInfo className="w-5 h-5 text-slate-500" /> Về Hệ Thống
            </h3>
            <div className="text-sm space-y-3 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Trạng thái:</span>
                <span className="font-bold text-green-600">Online</span>
              </div>
              <div className="flex justify-between">
                <span>Phiên bản:</span>
                <span className="font-medium">1.0.0-Beta</span>
              </div>
              <div className="flex justify-between">
                <span>Bảo trì CC:</span>
                <span className="font-medium">Tắt</span>
              </div>
            </div>
            <button className="w-full mt-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 py-2 rounded-lg text-sm font-medium transition">
              Cập nhật phần mềm
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
            <h3 className="font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3 text-slate-900 dark:text-white">
              <Bell className="w-5 h-5 text-slate-500" /> Tùy chọn Thông báo
            </h3>
            <div className="space-y-3 text-sm">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300" defaultChecked />
                <span className="text-slate-700 dark:text-slate-300">Gửi Email khi có máy hỏng</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300" defaultChecked />
                <span className="text-slate-700 dark:text-slate-300">Báo cáo tóm tắt hàng ngày</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                <span className="text-slate-700 dark:text-slate-300">Kích hoạt thông báo SMS</span>
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
