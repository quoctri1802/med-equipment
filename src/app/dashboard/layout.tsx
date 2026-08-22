import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import Link from "next/link"
import { FlaskConical, MapPin, Phone, Mail, ShieldCheck, QrCode } from "lucide-react"

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
        <footer className="mt-12 bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 p-6 md:p-8 text-slate-500 dark:text-slate-400 text-xs z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Cột 1: Thương hiệu */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 group">
                <div className="p-2 bg-blue-600/10 rounded-xl border border-blue-500/20 shadow-inner">
                  <FlaskConical className="h-5 w-5 text-blue-500" />
                </div>
                <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white uppercase">
                  LabEquip <span className="text-blue-500">Center</span>
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                TTYT Khu vực Liên Chiểu - Khoa Xét nghiệm
              </p>
              <p className="text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                Giải pháp số hóa toàn diện giúp giám sát, kiểm định, hiệu chuẩn QC và theo dõi thiết bị xét nghiệm y khoa theo tiêu chuẩn chất lượng.
              </p>
            </div>

            {/* Cột 2: Liên kết nhanh */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-black uppercase text-slate-900 dark:text-white tracking-widest border-b border-slate-100 dark:border-slate-700 pb-2">
                Liên kết nhanh
              </h4>
              <ul className="space-y-2.5 font-bold">
                <li>
                  <Link href="/" className="hover:text-cyan-500 dark:hover:text-cyan-400 hover:translate-x-1 transition-all duration-300 flex items-center gap-1.5 w-fit">
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-cyan-500 dark:hover:text-cyan-400 hover:translate-x-1 transition-all duration-300 flex items-center gap-1.5 w-fit">
                    Bảng điều khiển
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-cyan-500 dark:hover:text-cyan-400 hover:translate-x-1 transition-all duration-300 flex items-center gap-1.5 w-fit">
                    Đăng nhập hệ thống
                  </Link>
                </li>
              </ul>
            </div>

            {/* Cột 3: Liên hệ */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-black uppercase text-slate-900 dark:text-white tracking-widest border-b border-slate-100 dark:border-slate-700 pb-2">
                Liên hệ & Hỗ trợ
              </h4>
              <ul className="space-y-3 font-medium text-slate-500 dark:text-slate-450">
                <li className="flex gap-2.5 items-start">
                  <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    Trung tâm Y tế khu vực Liên Chiểu : 525 Tôn Đức Thắng, phường Hòa Khánh, TP. Đà Nẵng
                  </span>
                </li>
                <li className="flex gap-2.5 items-center">
                  <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">0906440970</span>
                </li>
                <li className="flex gap-2.5 items-center">
                  <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="font-mono">tranquangvu230789@gmail.com</span>
                </li>
              </ul>
            </div>

            {/* Cột 4: Tiêu chuẩn */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-black uppercase text-slate-900 dark:text-white tracking-widest border-b border-slate-100 dark:border-slate-700 pb-2">
                Tiêu chuẩn kỹ thuật
              </h4>
              <div className="space-y-3 font-medium">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] font-extrabold text-slate-900 dark:text-white">ISO 15189 COMPLIANT</div>
                    <div className="text-[9px] text-slate-500">Quản lý chất lượng xét nghiệm</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl">
                  <QrCode className="w-5 h-5 text-cyan-500 dark:text-cyan-400 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] font-extrabold text-slate-900 dark:text-white">QR IDENTIFIER</div>
                    <div className="text-[9px] text-slate-500">Định danh số hóa thiết bị</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider & Copyright */}
          <div className="border-t border-slate-100 dark:border-slate-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 dark:text-slate-500 font-bold">
            <div>
              &copy; {new Date().getFullYear()} TTYT Khu vực Liên Chiểu - Khoa Xét nghiệm. Tất cả các quyền được bảo lưu.
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] flex flex-wrap justify-center items-center gap-x-2 gap-y-1">
              <span>Design by</span>
              <span className="text-blue-500">tritnq</span>
              <span className="text-slate-350 dark:text-slate-700">|</span>
              <span className="text-slate-500 dark:text-slate-400 font-normal normal-case">Hỗ trợ kỹ thuật: 0905924194</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
