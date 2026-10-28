import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import Link from "next/link"
import { FlaskConical, MapPin, Phone, Mail, ShieldCheck, QrCode, Smartphone, Sparkles, Clock, Lock } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Sidebar userRole={session.user.role} userPermissions={session.user.permissions || ""} />
      <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-8 flex flex-col justify-between">
        <div className="flex-1">
          {children}
        </div>
        <footer className="mt-12 bg-white dark:bg-slate-800/90 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700/60 p-6 md:p-8 text-slate-500 dark:text-slate-400 text-xs z-10 transition-colors backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start">
            {/* Cột 1: Đơn vị chủ quản & Thương hiệu (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2.5 group">
                <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-cyan-500 text-white rounded-2xl shadow-md shadow-blue-500/20">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-black text-base tracking-tight text-slate-900 dark:text-white uppercase">
                    LabEquip <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Center</span>
                  </span>
                  <span className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    v2.5 Pro
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[12px] font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Trung tâm Y tế khu vực Liên Chiểu
                </p>
                <p className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-widest">
                  Khoa Xét Nghiệm
                </p>
              </div>

              <p className="text-slate-600 dark:text-slate-350 leading-relaxed font-medium text-[11px] max-w-md">
                Giải pháp số hóa toàn diện giúp giám sát tình trạng vận hành, kiểm định chất lượng IQC/EQC, hiệu chuẩn định kỳ và theo dõi trang thiết bị xét nghiệm y khoa theo chuẩn mực an toàn sinh học.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Hệ thống trực tuyến 24/7
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  <Smartphone className="w-3 h-3 text-blue-500" />
                  Hỗ trợ PWA Mobile & Tablet
                </span>
              </div>
            </div>

            {/* Cột 2: Hỗ trợ Kỹ thuật & Địa chỉ trực (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-4">
              <h4 className="text-[11px] font-black uppercase text-slate-900 dark:text-white tracking-widest border-b border-slate-100 dark:border-slate-700/80 pb-2.5 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Hỗ trợ kỹ thuật & Trực ban
              </h4>

              <ul className="space-y-3 font-medium text-slate-600 dark:text-slate-350 text-[11px]">
                <li className="flex gap-2.5 items-start">
                  <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    Trung tâm Y tế khu vực Liên Chiểu: 525 Tôn Đức Thắng, phường Hòa Khánh, TP. Đà Nẵng
                  </span>
                </li>

                <li className="flex gap-2.5 items-center">
                  <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[10px] uppercase">Hotline:</span>
                    <a
                      href="tel:0906440970"
                      className="font-mono font-black text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-400 transition text-xs"
                    >
                      0906440970
                    </a>
                    <span className="px-2 py-0.5 text-[9px] font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800">
                      24/7
                    </span>
                  </div>
                </li>

                <li className="flex gap-2.5 items-center">
                  <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[10px] uppercase">Email:</span>
                    <a
                      href="mailto:tranquangvu230789@gmail.com"
                      className="font-mono font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-cyan-400 transition"
                    >
                      tranquangvu230789@gmail.com
                    </a>
                  </div>
                </li>

                <li className="pt-1 text-[10px] text-slate-400 italic">
                  * Tiếp nhận cảnh báo sự cố hỏng máy, phiếu bảo trì & kiểm định hiệu chuẩn thiết bị.
                </li>
              </ul>
            </div>

            {/* Cột 3: Tiêu chuẩn kỹ thuật & An toàn thông tin (lg:col-span-3) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-[11px] font-black uppercase text-slate-900 dark:text-white tracking-widest border-b border-slate-100 dark:border-slate-700/80 pb-2.5 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Tiêu chuẩn kỹ thuật
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-700/80 p-2.5 rounded-2xl hover:border-emerald-500/40 transition">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      ISO 15189 COMPLIANT
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">
                      Quản lý chất lượng phòng xét nghiệm y khoa
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-700/80 p-2.5 rounded-2xl hover:border-cyan-500/40 transition">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      QR CODE IDENTIFIER
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">
                      Định danh số hóa trang thiết bị
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-700/80 p-2.5 rounded-2xl hover:border-blue-500/40 transition">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      BẢO MẬT & PHÂN QUYỀN RBAC
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">
                      Kiểm soát dữ liệu & xác thực người dùng
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dải chân trang đáy (Bottom Copyright & Credits) */}
          <div className="border-t border-slate-100 dark:border-slate-700/80 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 dark:text-slate-400 font-bold text-[11px]">
            <div>
              &copy; {new Date().getFullYear()} Trung tâm Y tế khu vực Liên Chiểu - Khoa Xét nghiệm. Bảo lưu mọi quyền.
            </div>
            <div className="text-[10px] uppercase tracking-[0.15em] flex flex-wrap justify-center items-center gap-x-2 gap-y-1">
              <span>Phát triển bởi</span>
              <span className="text-blue-600 dark:text-cyan-400 font-extrabold">QUỐC TRÍ</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium normal-case">
                Hỗ trợ kỹ thuật: <strong className="text-slate-700 dark:text-slate-200">0906440970</strong>
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
