"use client"

import React, { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"

const QRScanner = dynamic(() => import("@/components/QRScanner"), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center w-full h-full bg-slate-800 text-slate-400">Đang khởi động camera...</div>
})

export default function MobileScannerPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleScanSuccess = useCallback(async (decodedText: string, scanner: any) => {
    // Hỗ trợ mọi định dạng: URL đầy đủ hoặc chỉ ID
    console.log("Mã QR đã quét:", decodedText);
    
    let targetId = "";

    if (decodedText.includes("/scan/")) {
      const parts = decodedText.split("/scan/");
      targetId = parts[parts.length - 1].split("?")[0];
    } else {
      // Giả định nếu không phải URL thì chính là ID thiết bị
      targetId = decodedText.trim();
    }

    if (targetId) {
      try {
         // Dừng camera trước khi chuyển trang để tránh xung đột
         await scanner.clear();
         // Chuyển hướng trực tiếp giúp trang web tải lại sạch sẽ trên mobile
         window.location.href = `/scan/${targetId}`;
      } catch (err) {
         console.error("Lỗi khi dừng camera:", err);
         window.location.href = `/scan/${targetId}`;
      }
    } else {
      setError("Không tìm thấy thông tin thiết bị trong mã QR");
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      <div className="p-4 flex items-center border-b border-slate-800">
        <Link href="/dashboard" className="p-2 hover:bg-slate-800 rounded-full transition-colors mr-2">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-bold">Quét mã QR Thiết bị</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Cảnh báo HTTPS */}
        {typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost' && (
          <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-xl text-yellow-200 text-sm flex gap-3 items-start max-w-sm">
            <span className="text-xl">⚠️</span>
            <p><strong>Lưu ý:</strong> Camera yêu cầu kết nối bảo mật (HTTPS) để hoạt động trên điện thoại. Hãy đảm bảo bạn đang truy cập qua link https://.</p>
          </div>
        )}

        <div className="w-full max-w-sm aspect-square bg-slate-800 rounded-3xl overflow-hidden shadow-2xl relative border-2 border-slate-700">
           <QRScanner onScanSuccess={handleScanSuccess} />
        </div>

        <p className="mt-8 text-center text-slate-400 max-w-xs">
          Đưa camera quét mã QR dán trên thân thiết bị y tế.
        </p>

        <button 
           onClick={() => window.location.reload()}
           className="mt-4 px-4 py-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
        >
           🔄 Thử tải lại camera
        </button>

        {error && (
            <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-lg text-sm border border-red-800">
                {error}
            </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
          #reader { width: 100%; border: none !important; }
          #reader__dashboard_section_csr button {
            background-color: #2563eb; color: white; padding: 8px 16px; border-radius: 8px; border: none; font-weight: 600; margin-top: 10px; cursor: pointer;
          }
          #reader__dashboard_section_swaplink { display: none; }
          #reader video { object-fit: cover; }
        `
      }} />
    </div>
  )
}
