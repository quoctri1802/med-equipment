"use client"

import { useRef } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Download, QrCode } from "lucide-react"

export default function QRCodeBox({ equipmentId, equipmentCode, equipmentName }: { 
  equipmentId: string, 
  equipmentCode: string,
  equipmentName: string 
}) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const downloadQRCode = () => {
    const canvas = canvasRef.current?.querySelector("canvas")
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream")
      let downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `QR_${equipmentCode}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  // Lấy URL trang báo cáo (ví dụ: https://domain/scan/[id])
  const scanUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/scan/${equipmentId}`

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">QR Code Định danh</h3>
      </div>
      
      <div ref={canvasRef} className="p-4 bg-white rounded-xl shadow-inner mb-6 ring-1 ring-slate-100 dark:ring-slate-700">
        <QRCodeCanvas
          value={scanUrl}
          size={180}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: "/logo.png",
            x: undefined,
            y: undefined,
            height: 34,
            width: 34,
            excavate: true,
          }}
        />
      </div>

      <p className="text-[10px] items-center text-center text-slate-500 mb-4 px-2 uppercase font-medium">
        Quét để truy cập trang báo cáo hàng ngày của {equipmentName}
      </p>

      <button
        onClick={downloadQRCode}
        className="flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95"
      >
        <Download className="w-4 h-4" />
        Tải mã QR (PNG)
      </button>
    </div>
  )
}
