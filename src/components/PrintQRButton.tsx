"use client"

import { Printer } from "lucide-react"

export default function PrintQRButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2.5 rounded-xl font-bold hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors print:hidden"
    >
      <Printer className="w-5 h-5" />
      <span>In Mã QR</span>
    </button>
  )
}
