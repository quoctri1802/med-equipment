"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
        <div>
          <label className="block text-xs font-bold text-[#475569] dark:text-slate-300 uppercase tracking-widest mb-1.5 ml-1">
            Email tài khoản
          </label>
          <div className="relative group">
            <input
              name="email"
              type="email"
              required
              className="block w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 px-4 py-3.5 text-sm text-[#0a192f] dark:text-white placeholder-slate-400 shadow-sm backdrop-blur-sm transition-all focus:border-[#1a56db] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-[#1a56db]/10"
              placeholder="ten.dang.nhap@med.com"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#475569] dark:text-slate-300 uppercase tracking-widest mb-1.5 ml-1">
            Mật khẩu xác thực
          </label>
          <div className="relative group">
            <input
              name="password"
              type="password"
              required
              className="block w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 px-4 py-3.5 text-sm text-[#0a192f] dark:text-white placeholder-slate-400 shadow-sm backdrop-blur-sm transition-all focus:border-[#1a56db] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-[#1a56db]/10"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-xs text-center font-bold bg-red-50 dark:bg-red-500/10 p-3 rounded-2xl border border-red-200 dark:border-red-500/20 animate-shake">
          {error}
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="relative flex w-full justify-center items-center gap-2 overflow-hidden rounded-full bg-[#0c2b64] hover:bg-[#133a80] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#0c2b64]/20 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
        >
          {loading ? (
             <div className="flex items-center gap-2">
               <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
               <span>Đang xác thực hệ thống...</span>
             </div>
          ) : "Đăng nhập hệ thống"}
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
