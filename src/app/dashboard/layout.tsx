import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import Link from "next/link"
import Image from "next/image"
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
      <main className="flex-1 overflow-y-auto p-3.5 sm:p-4 pb-28 md:p-8 md:pb-8 flex flex-col justify-between">
        {/* Mobile Top App Bar */}
        <div className="md:hidden mb-4 p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white p-0.5 shadow-sm border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center">
              <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded-lg" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase text-slate-900 dark:text-white truncate tracking-tight">
                TTYT Liên Chiểu
              </p>
              <p className="text-[9px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider truncate">
                Khoa Xét Nghiệm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/scanner"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-[10px] uppercase tracking-wider shadow-md shadow-blue-500/20 active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Quét QR</span>
            </Link>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 font-black text-xs flex items-center justify-center border border-blue-200 dark:border-blue-800">
              {((session.user?.name || session.user?.email || "U")[0]).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {children}
        </div>
        <footer className="mt-12 relative overflow-hidden bg-gradient-to-br from-white via-slate-50/80 to-blue-50/30 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 rounded-[2.5rem] shadow-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-10 text-slate-500 dark:text-slate-400 text-xs z-10 backdrop-blur-xl">
          {/* Subtle Ambient Glow Effects */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-10 right-10 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/50 dark:via-cyan-400/50 to-transparent pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-10 items-start">
            {/* Cột 1: Đơn vị chủ quản & Thương hiệu (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3 group">
                <div className="p-3 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white rounded-2xl shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
                  <FlaskConical className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white uppercase">
                      LabEquip <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-500 dark:from-blue-400 dark:via-cyan-300 dark:to-indigo-400">Center</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-cyan-300 border border-blue-500/30">
                      v2.5 Pro
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    Hệ thống số hóa trang thiết bị y tế
                  </p>
                </div>
              </div>

              <div className="space-y-1 bg-slate-100/60 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/5">
                <p className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Trung tâm Y tế khu vực Liên Chiểu
                </p>
                <p className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                  Khoa Xét Nghiệm • Chẩn đoán & Kiểm định
                </p>
              </div>

              <p className="text-slate-600 dark:text-slate-350 leading-relaxed font-medium text-[11px] max-w-md">
                Giải pháp số hóa toàn diện giúp giám sát tình trạng vận hành, kiểm định chất lượng IQC/EQC, hiệu chuẩn định kỳ và theo dõi trang thiết bị xét nghiệm y khoa theo chuẩn mực an toàn sinh học.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Hệ thống trực tuyến 24/7
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800/80 shadow-sm">
                  <Smartphone className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
                  Hỗ trợ PWA Mobile & Tablet
                </span>
              </div>
            </div>

            {/* Cột 2: Hỗ trợ Kỹ thuật & Địa chỉ trực (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-4">
              <h4 className="text-[11px] font-black uppercase text-slate-900 dark:text-white tracking-widest border-b border-slate-200/80 dark:border-slate-800 pb-2.5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Hỗ trợ kỹ thuật & Trực ban 24/7
              </h4>

              {/* Hotline Highlight Card */}
              <div className="bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-transparent border border-blue-500/20 dark:border-blue-500/30 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    Đường dây nóng kỹ thuật
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Sẵn sàng
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <a
                      href="tel:0906440970"
                      className="font-mono font-black text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-300 transition text-base tracking-wide"
                    >
                      0906.440.970
                    </a>
                    <p className="text-[10px] text-slate-400 font-medium">Bấm gọi hỗ trợ khẩn cấp</p>
                  </div>
                </div>
              </div>

              <ul className="space-y-3 font-medium text-slate-600 dark:text-slate-350 text-[11px]">
                <li className="flex gap-2.5 items-start">
                  <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    Trung tâm Y tế khu vực Liên Chiểu: 525 Tôn Đức Thắng, phường Hòa Khánh, TP. Đà Nẵng
                  </span>
                </li>

                <li className="flex gap-2.5 items-center">
                  <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-slate-400 text-[10px] uppercase">Email:</span>
                    <a
                      href="mailto:tranquangvu230789@gmail.com"
                      className="font-mono font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-cyan-400 transition truncate"
                    >
                      tranquangvu230789@gmail.com
                    </a>
                  </div>
                </li>

                <li className="pt-1 text-[10px] text-slate-400 italic">
                  * Tiếp nhận báo cáo sự cố máy móc, phiếu bảo dưỡng & kiểm định hiệu chuẩn thiết bị.
                </li>
              </ul>
            </div>

            {/* Cột 3: Tiêu chuẩn kỹ thuật & An toàn thông tin (lg:col-span-3) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-[11px] font-black uppercase text-slate-900 dark:text-white tracking-widest border-b border-slate-200/80 dark:border-slate-800 pb-2.5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Tiêu chuẩn & Kiểm định
              </h4>

              <div className="space-y-2.5">
                <div className="group flex items-center gap-3 bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 p-3 rounded-2xl hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        ISO 15189:2022
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                        VERIFIED
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                      Quản lý chất lượng xét nghiệm y khoa
                    </p>
                  </div>
                </div>

                <div className="group flex items-center gap-3 bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 p-3 rounded-2xl hover:border-cyan-500/50 hover:shadow-md hover:shadow-cyan-500/5 transition-all duration-300">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        QR IDENTIFIER
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                      Tem định danh số hóa máy xét nghiệm
                    </p>
                  </div>
                </div>

                <div className="group flex items-center gap-3 bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 p-3 rounded-2xl hover:border-indigo-500/50 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        BẢO MẬT RBAC
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                        SECURE
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                      Phân quyền đa tầng & kiểm soát truy cập
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dải chân trang đáy (Bottom Copyright & Credits) */}
          <div className="relative z-10 border-t border-slate-200/80 dark:border-slate-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 dark:text-slate-400 font-bold text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>&copy; {new Date().getFullYear()} Trung tâm Y tế khu vực Liên Chiểu - Khoa Xét nghiệm. Bảo lưu mọi quyền.</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.15em] flex flex-wrap justify-center items-center gap-x-2 gap-y-1">
              <span>Phát triển bởi</span>
              <span className="text-blue-600 dark:text-cyan-400 font-black">QUỐC TRÍ</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium normal-case">
                Hỗ trợ kỹ thuật: <strong className="text-slate-700 dark:text-slate-200 font-mono">0906440970</strong>
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
