"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  FlaskConical,
  Wrench,
  LogOut,
  Settings,
  ShieldAlert,
  FileSpreadsheet,
  Dna,
  Archive,
  QrCode,
  Smartphone,
  Download,
  Menu,
  X,
  ChevronRight
} from "lucide-react"

export default function Sidebar({ userRole, userPermissions = "" }: { userRole: string, userPermissions?: string }) {
  const pathname = usePathname()
  const perms = userPermissions.split(',')
  const isAdmin = userRole === "ADMIN"

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  // Đóng Mobile Drawer khi chuyển trang
  useEffect(() => {
    setIsMobileDrawerOpen(false)
  }, [pathname])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
      setIsStandalone(standalone)
    }

    const handlePrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener("beforeinstallprompt", handlePrompt)
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt)
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setDeferredPrompt(null)
      }
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-install-modal"))
    }
  }

  const openInstallGuide = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-install-modal"))
    }
  }

  const navItems = [
    { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
    { name: "Quét mã QR", href: "/scanner", icon: QrCode },
  ]

  if (isAdmin || perms.includes("EQUIPMENT_VIEW")) {
    navItems.push({ name: "Thiết bị xét nghiệm", href: "/dashboard/equipment", icon: FlaskConical })
  }
  
  if (isAdmin || perms.includes("EQUIPMENT_VIEW")) {
    navItems.push({ name: "Hóa chất & Vật tư", href: "/dashboard/reagents", icon: Dna })
  }
  
  if (isAdmin || perms.includes("MAINTENANCE_MANAGE")) {
    navItems.push({ name: "Lịch bảo trì", href: "/dashboard/maintenance", icon: Wrench })
  }

  if (isAdmin || perms.includes("EQUIPMENT_VIEW") || perms.includes("MAINTENANCE_MANAGE")) {
    navItems.push({ name: "Thanh lý thiết bị", href: "/dashboard/liquidation", icon: Archive })
  }

  if (isAdmin) {
    navItems.push({ name: "Cảnh báo & AI", href: "/dashboard/alerts", icon: ShieldAlert })
  }

  if (isAdmin || perms.includes("REPORT_VIEW")) {
    navItems.push({ name: "Báo cáo", href: "/dashboard/reports", icon: FileSpreadsheet })
  }

  if (isAdmin) {
    navItems.push({ name: "Cài đặt", href: "/dashboard/settings", icon: Settings })
  }

  return (
    <>
      {/* Sidebar Desktop */}
      <div className="w-64 shrink-0 bg-slate-950 border-r border-white/5 flex flex-col h-full shadow-2xl hidden md:flex z-50">
        {/* Header containing the hospital logo and full name */}
        <div className="h-24 flex items-center px-5 border-b border-white/5 gap-3 bg-slate-950">
          <div className="bg-white p-1 rounded-full shadow-md flex-shrink-0">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-full" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-white font-extrabold text-[15px] tracking-tight leading-tight uppercase">
              Trung tâm Y tế <br />
              <span className="text-slate-350">Khu vực Liên Chiểu</span>
            </span>
            <span className="text-[10px] text-blue-500 font-extrabold tracking-wider uppercase mt-1">
              Khoa Xét nghiệm
            </span>
          </div>
        </div>
        
        {/* Navigation items */}
        <div className="flex-1 py-6 flex flex-col gap-1.5 px-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 group border ${
                  isActive 
                    ? "bg-gradient-to-r from-blue-600 to-cyan-550 text-white border-white/10 shadow-lg shadow-blue-500/20" 
                    : "text-slate-400 border-transparent hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-white animate-pulse" : "text-slate-500"}`} />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* PWA Install Banner Desktop */}
        {!isStandalone && (
          <div className="p-3.5 mx-3 mb-3 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/60 rounded-2xl border border-cyan-500/30 text-white space-y-2 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/20 rounded-lg text-cyan-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-black uppercase text-cyan-300 tracking-wider">Cài đặt ứng dụng</p>
            </div>
            <p className="text-[10px] text-slate-350 leading-snug">
              Cài app lên điện thoại để quét mã QR và vận hành thiết bị nhanh chóng!
            </p>
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-3 h-3" />
              <span>Cài đặt ngay</span>
            </button>
          </div>
        )}

        {/* Footer Logout button */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-xs font-bold text-red-500 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all group"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0 group-hover:-translate-x-1 transition-transform" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Bottom Navigation for Mobile (5-tab App Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 shadow-2xl z-[100] pb-env-safe rounded-t-3xl">
        <div className="grid grid-cols-5 items-center px-2 py-1.5 relative">
          {/* Tab 1: Tổng quan */}
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center py-2 transition-all ${
              pathname === "/dashboard"
                ? "text-blue-500 font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-1" strokeWidth={pathname === "/dashboard" ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-tight">Tổng quan</span>
          </Link>

          {/* Tab 2: Thiết bị */}
          <Link
            href="/dashboard/equipment"
            className={`flex flex-col items-center justify-center py-2 transition-all ${
              pathname.startsWith("/dashboard/equipment")
                ? "text-blue-500 font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FlaskConical className="w-5 h-5 mb-1" strokeWidth={pathname.startsWith("/dashboard/equipment") ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-tight">Thiết bị</span>
          </Link>

          {/* Tab 3 (Center Action Button): Quét mã QR */}
          <div className="flex flex-col items-center justify-center relative -top-3">
            <Link
              href="/scanner"
              className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 text-white shadow-xl shadow-cyan-500/35 border-2 border-slate-950 flex items-center justify-center active:scale-95 transition-transform"
              title="Quét mã QR thiết bị"
            >
              <QrCode className="w-6 h-6 animate-pulse" />
            </Link>
            <span className="text-[9px] font-black uppercase tracking-tight text-cyan-400 mt-1">
              Quét QR
            </span>
          </div>

          {/* Tab 4: Lịch bảo trì */}
          <Link
            href="/dashboard/maintenance"
            className={`flex flex-col items-center justify-center py-2 transition-all ${
              pathname === "/dashboard/maintenance"
                ? "text-blue-500 font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Wrench className="w-5 h-5 mb-1" strokeWidth={pathname === "/dashboard/maintenance" ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-tight">Bảo trì</span>
          </Link>

          {/* Tab 5: Menu mở rộng */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className={`flex flex-col items-center justify-center py-2 transition-all relative ${
              isMobileDrawerOpen || ["/dashboard/reagents", "/dashboard/liquidation", "/dashboard/alerts", "/dashboard/reports", "/dashboard/settings"].some(p => pathname.startsWith(p))
                ? "text-cyan-400 font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <div className="relative">
              <Menu className="w-5 h-5 mb-1" />
              {["/dashboard/reagents", "/dashboard/liquidation", "/dashboard/alerts", "/dashboard/reports", "/dashboard/settings"].some(p => pathname.startsWith(p)) && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-tight">Thêm</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Sheet menu khi bấm Thêm) */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative z-10 bg-slate-950 border-t border-cyan-500/30 rounded-t-[2.5rem] p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom duration-300">
            {/* Thanh gạt trên cùng */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto -mt-2 mb-2" />

            {/* Header Drawer */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-blue-500/20">
                  {userRole.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase text-white tracking-wide">
                    Danh mục chuyên môn
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Tài khoản: <span className="text-cyan-400 font-bold">{userRole}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid tất cả các tính năng */}
            <div className="grid grid-cols-2 gap-3">
              {(isAdmin || perms.includes("EQUIPMENT_VIEW")) && (
                <Link
                  href="/dashboard/reagents"
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-white/10 transition flex flex-col gap-2 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Dna className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-tight">Hóa chất & Vật tư</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Quản lý kho & hạn dùng</p>
                  </div>
                </Link>
              )}

              {(isAdmin || perms.includes("EQUIPMENT_VIEW") || perms.includes("MAINTENANCE_MANAGE")) && (
                <Link
                  href="/dashboard/liquidation"
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/40 hover:bg-white/10 transition flex flex-col gap-2 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                    <Archive className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-tight">Thanh lý thiết bị</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Đề xuất & kiểm định</p>
                  </div>
                </Link>
              )}

              {isAdmin && (
                <Link
                  href="/dashboard/alerts"
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-white/10 transition flex flex-col gap-2 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-tight">Cảnh báo & AI</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Dự đoán sự cố máy</p>
                  </div>
                </Link>
              )}

              {(isAdmin || perms.includes("REPORT_VIEW")) && (
                <Link
                  href="/dashboard/reports"
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/10 transition flex flex-col gap-2 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-tight">Báo cáo & Sổ sách</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Xuất Excel kiểm định</p>
                  </div>
                </Link>
              )}

              {isAdmin && (
                <Link
                  href="/dashboard/settings"
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 hover:bg-white/10 transition flex flex-col gap-2 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-tight">Cài đặt hệ thống</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Tài khoản & phân quyền</p>
                  </div>
                </Link>
              )}

              {!isStandalone && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false)
                    openInstallGuide()
                  }}
                  className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/40 transition flex flex-col gap-2 text-left group"
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 animate-bounce" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-cyan-300 uppercase tracking-tight">Cài App điện thoại</p>
                    <p className="text-[10px] text-cyan-400/80 mt-0.5 line-clamp-1">Mở 1 chạm PWA</p>
                  </div>
                </button>
              )}
            </div>

            {/* Logout button */}
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full py-3 px-4 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 rounded-2xl text-red-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất tài khoản</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
