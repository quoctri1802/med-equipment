import { Metadata } from "next"
import { Suspense } from "react"
import LoginForm from "@/components/LoginForm"
import Link from "next/link"
import Image from "next/image"
import { Dna, ArrowLeft, ShieldCheck, Lock } from "lucide-react"

export const metadata: Metadata = {
  title: "Đăng nhập | Genova Biosciences - Quản lý thiết bị xét nghiệm",
  description: "Cổng đăng nhập hệ thống quản lý thiết bị phòng xét nghiệm y khoa - TTYT Liên Chiểu",
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8fafc] font-sans text-[#0a192f] p-4 sm:p-6">
      {/* Background DNA Video */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center filter brightness-[0.95]"
        >
          <source src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/dna_video.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Video Overlay with Biotech Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background: "linear-gradient(135deg, rgba(240, 248, 255, 0.94) 0%, rgba(224, 242, 254, 0.88) 50%, rgba(240, 248, 255, 0.75) 100%)"
        }}
      />

      {/* Back to Home floating button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-white text-[#0a192f] text-xs font-semibold backdrop-blur-md border border-black/10 shadow-sm hover:shadow transition-all hover:-translate-y-0.5 active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#1a56db]" />
          <span>Về trang chủ</span>
        </Link>
      </div>

      <div className="relative w-full max-w-md my-8 animate-fade-in-up">
        {/* Main Glassmorphic Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/80 dark:bg-slate-900/80 p-8 sm:p-10 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(12,43,100,0.15)]">
          {/* Subtle top glow line */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#1a56db]/50 to-transparent pointer-events-none" />

          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center mb-8">
            {/* Chip Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e0f2fe] text-[#0369a1] text-[11px] font-semibold tracking-wider uppercase mb-5 border border-[#0369a1]/15">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0369a1] animate-pulse" />
              <span>CỔNG XÁC THỰC BẢO MẬT</span>
            </div>

            {/* Combined Brand Logo with DNA and Hospital Icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] border border-[#1a56db]/20 text-[#1a56db] flex items-center justify-center shadow-md shadow-[#1a56db]/10">
                <Dna className="w-6 h-6 animate-pulse" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-slate-200 shadow-sm flex items-center justify-center">
                <Image 
                  src="/logo.png" 
                  alt="Logo TTYT Liên Chiểu" 
                  width={40} 
                  height={40} 
                  className="rounded-xl object-contain"
                />
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0a192f] dark:text-white">
                Genova <span className="text-[#1a56db]">LabEquip</span>
              </h1>
              <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#475569] mt-1">
                TTYT KHU VỰC LIÊN CHIỂU • KHOA XÉT NGHIỆM
              </p>
            </div>
          </div>

          {/* Login Form Container */}
          <div className="space-y-4">
            <Suspense fallback={<div className="text-center text-xs text-slate-500 py-8">Đang khởi tạo biểu mẫu xác thực...</div>}>
              <LoginForm />
            </Suspense>
          </div>

          {/* Security & Verification Badges */}
          <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[10px] text-[#475569] font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              ISO 15189:2022
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-[#1a56db]" />
              Xác thực RBAC 256-bit
            </span>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-6 text-center text-[11px] text-[#475569] font-medium">
          &copy; {new Date().getFullYear()} Genova Biosciences • Phát triển bởi <strong className="text-[#0a192f] font-bold">QUỐC TRÍ</strong>
        </div>
      </div>
    </div>
  )
}
