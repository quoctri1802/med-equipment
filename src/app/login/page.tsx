import { Metadata } from "next"
import LoginForm from "@/components/LoginForm"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Đăng nhập | Quản lý thiết bị y tế",
  description: "Trang đăng nhập hệ thống Trung tâm Y tế Liên Chiểu",
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4 font-sans text-slate-200">
      {/* Background Orbs/Gradients */}
      <div className="absolute top-0 -left-20 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-20 h-96 w-96 rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
      
      <div className="relative w-full max-w-md">
        {/* Brand/Logo Section */}
        <div className="mb-8 flex flex-col items-center justify-center animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-blue-500 to-red-600 blur opacity-40 group-hover:opacity-60 transition duration-1000" />
            <div className="relative bg-white p-1 rounded-full shadow-2xl">
              <Image 
                src="/logo.png" 
                alt="Logo Liên Chiểu" 
                width={140} 
                height={140} 
                className="rounded-full"
                priority
              />
            </div>
          </div>
          <div className="mt-6 text-center">
            <h1 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
              Med-Equipment <span className="text-blue-500">Pro</span>
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-400">
              TRUNG TÂM Y TẾ KHU VỰC LIÊN CHIỂU
            </p>
          </div>
        </div>

        {/* Login Form Container - Glassmorphism */}
        <div className="login-card overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl transition shadow-2xl animate-in fade-in zoom-in duration-700">
           <div className="rounded-[22px] bg-slate-900/40 p-8 shadow-inner">
             <LoginForm />
           </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center space-y-1">
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              Design by <span className="text-blue-500">tritnq</span>
           </p>
           <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">
              Hỗ trợ kỹ thuật: <span className="text-slate-400">0905924194</span>
           </p>
        </div>
      </div>
    </div>
  )
}
