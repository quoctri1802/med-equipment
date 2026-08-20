"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MobileScannerPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/dashboard")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400 text-xs">
      Đang chuyển hướng về bảng điều khiển...
    </div>
  )
}
