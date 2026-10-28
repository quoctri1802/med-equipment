import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { formatDateVN } from "@/lib/date"
import ScanTabs from "@/components/ScanTabs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { Lock, LogIn, QrCode, ShieldCheck, UserCheck, LayoutDashboard } from "lucide-react"

export default async function ScanPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const isAuthenticated = Boolean(session?.user)
  const currentUser = session?.user || null

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

  // Lấy các bản ghi khai báo có ảnh & lịch sử báo cáo
  const logs = await prisma.log.findMany({
    where: { equipmentId: equipment.id },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  const images = logs
    .filter(log => Boolean(log.imageUrl))
    .map(log => ({
      id: log.id,
      imageUrl: log.imageUrl as string,
      status: log.status,
      note: log.note,
      reporterName: log.reporterName,
      userName: log.user?.name || log.user?.email || null,
      createdAt: log.createdAt
    }))

  const activeUsage = await prisma.usageLog.findFirst({
    where: { equipmentId: equipment.id, endTime: null },
    orderBy: { startTime: 'desc' }
  })
  
  const usageHistory = await prisma.usageLog.findMany({
    where: { equipmentId: equipment.id },
    orderBy: { startTime: 'desc' },
    take: 10
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "WORKING":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black border bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">SẴN SÀNG</span>
      case "WARNING":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black border bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800">CẦN HIỆU CHUẨN</span>
      case "BROKEN":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black border bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800">SỰ CỐ / HỎNG</span>
      case "PENDING_LIQUIDATION":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800">CHỜ THANH LÝ</span>
      case "LIQUIDATED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black border bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">ĐÃ THANH LÝ</span>
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black border bg-slate-50 text-slate-700 border-slate-200">{status}</span>
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-900 pb-20 pt-8 px-4 text-center shadow-md">
        <h1 className="text-lg font-black text-white uppercase tracking-wider">TTYT KHU VỰC LIÊN CHIỂU</h1>
        <p className="text-blue-100 text-xs mt-1 font-semibold uppercase tracking-widest">Khoa Xét Nghiệm</p>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-12 space-y-6">
        {/* Device Information Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 p-6">
          <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase leading-tight">{equipment.name}</h2>
              <p className="font-mono text-slate-400 dark:text-slate-500 font-bold text-xs mt-1">{equipment.code}</p>
            </div>
            {getStatusBadge(equipment.status)}
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
              <p className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{equipment.model || '--'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase">Số serial</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{equipment.serialNumber || '--'}</p>
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
                <p className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 text-xs mt-1 leading-relaxed">{equipment.contactInfo}</p>
              </div>
            )}
            {equipment.usageNotes && (
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase">Lưu ý khi sử dụng</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 text-xs mt-1 leading-relaxed">{equipment.usageNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Khối chức năng: Nếu chưa đăng nhập thì chỉ xem thông tin, nếu đã đăng nhập thì mở tab báo cáo */}
        {!isAuthenticated ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-amber-200/80 dark:border-amber-700/50 p-6 text-center space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-200/80 dark:border-amber-900/50 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-black uppercase text-slate-900 dark:text-white">
                Chế độ chỉ xem thông tin thiết bị
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Hệ thống yêu cầu <strong>đăng nhập tài khoản nhân viên</strong> để báo cáo trạng thái, chụp ảnh hiện trạng hoặc đăng ký nhật ký vận hành cho thiết bị này.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
              <Link
                href={`/login?callbackUrl=/scan/${encodeURIComponent(cleanId)}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/25 active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập để báo cáo trạng thái
              </Link>
              <Link
                href="/scanner"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
              >
                <QrCode className="w-4 h-4" />
                Quét thiết bị khác
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Banner hiển thị nhân viên đang đăng nhập */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white">
                    {currentUser?.name || currentUser?.email}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Nhân viên báo cáo • <span className="font-semibold text-blue-600 dark:text-blue-400">{currentUser?.role}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 font-bold text-[10px] rounded-full border border-green-200 dark:border-green-800">
                  <ShieldCheck className="w-3.5 h-3.5" /> Đã xác thực
                </span>
                <Link
                  href="/dashboard"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  title="Về Bảng điều khiển"
                >
                  <LayoutDashboard className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Tabs: Report + Capture Photo, View Captured Photos, Usage */}
            <ScanTabs
              equipmentId={equipment.id}
              equipmentName={equipment.name}
              equipmentCode={equipment.code}
              images={images}
              activeUsage={activeUsage}
              usageHistory={usageHistory}
              currentUser={currentUser}
            />
          </div>
        )}
      </div>
    </div>
  );
}
