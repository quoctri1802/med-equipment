"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import QRScanner from "@/components/QRScanner"
import { ArrowLeft, FlaskConical, QrCode, ShieldCheck } from "lucide-react"

export default function MobileScannerPage() {
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  // Trích xuất mã thiết bị từ đường link URL hoặc chuỗi mã thô
  const extractEquipmentCode = (rawText: string): string => {
    const trimmed = rawText.trim()

    // 1. Nếu là đường dẫn URL /scan/ID hoặc http://domain/scan/ID
    const scanMatch = trimmed.match(/\/scan\/([^/?#]+)/i)
    if (scanMatch && scanMatch[1]) {
      return decodeURIComponent(scanMatch[1])
    }

    // 2. Nếu là đường dẫn URL /equipment/ID
    const eqMatch = trimmed.match(/\/equipment\/([^/?#]+)/i)
    if (eqMatch && eqMatch[1]) {
      return decodeURIComponent(eqMatch[1])
    }

    // 3. Nếu là mã thô (mã máy hoặc ID)
    return trimmed
  }

  const handleScanSuccess = (decodedText: string) => {
    const targetCode = extractEquipmentCode(decodedText)
    setRedirecting(true)
    router.push(`/scan/${encodeURIComponent(targetCode)}`)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />

      {/* Header bar */}
      <header className="px-4 py-4 border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Bảng điều khiển</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600/10 rounded-xl border border-blue-500/20">
            <FlaskConical className="w-4 h-4 text-blue-500" />
          </div>
          <span className="font-extrabold text-xs tracking-tight uppercase text-white">
            LabEquip <span className="text-blue-500">Scanner</span>
          </span>
        </div>

        <div className="w-20" /> {/* Spacer */}
      </header>

      {/* Main scanner container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-lg mx-auto w-full z-10">
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-widest">
            <QrCode className="w-3.5 h-3.5" />
            Máy quét mã QR Thiết bị
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Quét mã QR Thiết Bị
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            TTYT Khu vực Liên Chiểu • Khoa Xét nghiệm
          </p>
        </div>

        {/* QR Scanner Component */}
        <div className="w-full">
          <QRScanner onScanSuccess={handleScanSuccess} />
        </div>

        {/* Chú thích an toàn thông tin */}
        <div className="mt-8 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-slate-400 max-w-sm text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Hệ thống bảo mật: Báo cáo trạng thái yêu cầu đăng nhập tài khoản nhân viên.</span>
        </div>
      </main>
    </div>
  )
}
