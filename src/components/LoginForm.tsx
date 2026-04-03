"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginForm() {
  const router = useRouter()
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
        router.push("/dashboard")
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
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
            Email của bạn
          </label>
          <div className="relative group">
            <input
              name="email"
              type="email"
              required
              className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 shadow-sm transition-all focus:border-blue-500/50 focus:bg-blue-500/5 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              placeholder="ten.dang.nhap@med.com"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
            Mật khẩu
          </label>
          <div className="relative group">
            <input
              name="password"
              type="password"
              required
              className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 shadow-sm transition-all focus:border-blue-500/50 focus:bg-blue-500/5 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-xs text-center font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20 animate-shake">
          {error}
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="relative flex w-full justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:from-blue-500 hover:to-blue-400 hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
        >
          {loading ? (
             <div className="flex items-center gap-2">
               <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
               <span>Đang xác thực...</span>
             </div>
          ) : "Đăng nhập ngay"}
        </button>
      </div>

      <div className="text-center">
         <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Design by <span className="text-blue-500">tritnq</span> | 0905924194
         </span>
      </div>
    </form>
  )
}
