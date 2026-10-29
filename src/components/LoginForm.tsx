"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        setError("Email hoặc mật khẩu không chính xác")
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      setError("Đã xảy ra lỗi xin thử lại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-5">
        {/* Email Field with Animated Left Icon */}
        <div>
          <label className="block text-xs font-bold text-[#475569] dark:text-slate-300 uppercase tracking-widest mb-1.5 ml-1">
            Email tài khoản
          </label>
          <div className="relative group">
            {/* Animated Mail Icon */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-[#1a56db] group-focus-within:scale-110 transition-all duration-300">
              <Mail className="w-4 h-4 transition-transform duration-300 group-hover:rotate-6" />
            </div>

            <input
              name="email"
              type="email"
              required
              className="block w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 pl-11 pr-4 py-3.5 text-sm text-[#0a192f] dark:text-white placeholder-slate-400 shadow-sm backdrop-blur-sm transition-all focus:border-[#1a56db] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-[#1a56db]/10"
              placeholder="ten.dang.nhap@med.com"
            />
          </div>
        </div>

        {/* Password Field with Animated Left Icon & Show/Hide Toggle */}
        <div>
          <label className="block text-xs font-bold text-[#475569] dark:text-slate-300 uppercase tracking-widest mb-1.5 ml-1">
            Mật khẩu xác thực
          </label>
          <div className="relative group">
            {/* Animated Lock Icon */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-[#1a56db] group-focus-within:scale-110 transition-all duration-300">
              <Lock className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-6" />
            </div>

            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="block w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 pl-11 pr-11 py-3.5 text-sm text-[#0a192f] dark:text-white placeholder-slate-400 shadow-sm backdrop-blur-sm transition-all focus:border-[#1a56db] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-[#1a56db]/10"
              placeholder="••••••••"
            />

            {/* Toggle Password Visibility Icon Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1a56db] p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 transition-transform hover:scale-110" />
              ) : (
                <Eye className="w-4 h-4 transition-transform hover:scale-110" />
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-xs text-center font-bold bg-red-50 dark:bg-red-500/10 p-3 rounded-2xl border border-red-200 dark:border-red-500/20 animate-shake">
          {error}
        </div>
      )}

      {/* Submit Button with Animated Icon & Shimmer */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="relative group flex w-full justify-center items-center gap-2.5 overflow-hidden rounded-full bg-[#0c2b64] hover:bg-[#133a80] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#0c2b64]/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-1000"
        >
          {loading ? (
             <div className="flex items-center gap-2">
               <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
               <span>Đang xác thực hệ thống...</span>
             </div>
          ) : (
            <>
              <span>Đăng nhập hệ thống</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </>
          )}
        </button>
      </div>

      <div className="text-center pt-1">
         <span className="text-[11px] text-slate-400 font-medium tracking-wide">
            Hỗ trợ kỹ thuật: <strong className="text-[#0a192f] dark:text-slate-200 font-mono">0906440970</strong>
         </span>
      </div>
    </form>
  )
}
