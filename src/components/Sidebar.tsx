"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Stethoscope,
  Wrench,
  LogOut,
  Settings,
  ShieldAlert,
  FileSpreadsheet
} from "lucide-react"

export default function Sidebar({ userRole, userPermissions = "" }: { userRole: string, userPermissions?: string }) {
  const pathname = usePathname()
  const perms = userPermissions.split(',')
  const isAdmin = userRole === "ADMIN"

  const navItems = [
    { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
  ]

  if (isAdmin || perms.includes("EQUIPMENT_VIEW")) {
    navItems.push({ name: "Thiết bị", href: "/dashboard/equipment", icon: Stethoscope })
  }
  
  if (isAdmin || perms.includes("MAINTENANCE_MANAGE")) {
    navItems.push({ name: "Bảo trì", href: "/dashboard/maintenance", icon: Wrench })
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
      <div className="w-64 shrink-0 bg-slate-900 border-r border-white/5 flex-col h-full shadow-2xl hidden md:flex z-50">
        <div className="h-24 flex items-center px-6 border-b border-white/5 gap-3">
          <div className="bg-white p-1 rounded-full shadow-lg">
            <Image src="/logo.png" alt="Logo" width={48} height={48} className="rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-sm tracking-tighter leading-tight">TTYT LIÊN CHIỂU</span>
            <span className="text-[10px] text-blue-500 font-bold tracking-widest uppercase">Management</span>
          </div>
        </div>
        
        <div className="flex-1 py-6 flex flex-col gap-1.5 px-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-300 group ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-white" : "text-slate-500"}`} />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 px-4 py-3 text-[13px] font-bold text-red-500 rounded-xl hover:bg-red-500/10 transition-all group"
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 flex items-center shadow-2xl z-[100] pb-env-safe rounded-t-3xl">
        <div className="flex-1 flex items-center overflow-x-auto hide-scrollbar px-2 py-2 gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all min-w-[76px] ${
                  isActive
                    ? "text-blue-500 bg-white/5"
                    : "text-slate-400"
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? "text-blue-500" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] font-bold uppercase tracking-tighter">{item.name}</span>
              </Link>
            )
          })}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl text-red-500 transition-colors min-w-[76px]"
          >
            <LogOut className="w-5 h-5 mb-1" />
            <span className="text-[9px] font-bold uppercase tracking-tighter text-center">Thoát</span>
          </button>
        </div>
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-3 py-1 rounded-full shadow-2xl">
           <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
              Design by <span className="text-blue-500">tritnq</span> | <span className="text-slate-400">0905924194</span>
           </p>
        </div>
      </div>
    </>
  )

}
