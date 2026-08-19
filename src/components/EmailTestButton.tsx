"use client"

import React, { useState } from "react"
import { Play, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"
import { triggerTestEmailReport } from "@/app/actions/report"

export default function EmailTestButton({ adminEmail }: { adminEmail: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  const handleTest = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await triggerTestEmailReport()
      if (res.success) {
        setResult({ success: true, message: "Báo cáo kiểm thử đã gửi thành công tới " + adminEmail + "!" })
      } else {
        setResult({ success: false, error: res.error || "Gửi email thất bại." })
      }
    } catch (err) {
      setResult({ success: false, error: err.message || "Đã xảy ra lỗi hệ thống." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
      <h3 className="font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3 text-slate-900 dark:text-white">
        <Play className="w-5 h-5 text-blue-500" /> Kiểm thử Gửi Email
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Bấm nút bên dưới để gửi một báo cáo mô phỏng trực tiếp tới email đăng nhập của bạn: <strong className="text-slate-700 dark:text-slate-355">{adminEmail}</strong>.
      </p>
      
      <button 
        onClick={handleTest}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-75 text-white py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 active:scale-98"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi báo cáo thử...
          </>
        ) : (
          "Gửi Email báo cáo thử"
        )}
      </button>

      {result && (
        <div className={"p-3.5 rounded-xl border text-xs font-medium " + (result.success ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-955/15 dark:border-green-900/30" : "bg-red-50 border-red-200 text-red-700 dark:bg-red-955/15 dark:border-red-900/30")}>
          <div className="flex gap-2">
            {result.success ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-650 flex-shrink-0" />
            )}
            <div className="space-y-1 overflow-hidden">
              <p className="font-bold">{result.success ? "Thành công" : "Chi tiết lỗi:"}</p>
              <p className="opacity-90 break-words whitespace-pre-wrap">{result.success ? result.message : result.error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
