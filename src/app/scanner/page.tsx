"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Html5QrcodeScanner } from "html5-qrcode"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function MobileScannerPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Create instance of HTML5 QC
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false // verbose
    );

    scanner.render(
      (decodedText) => {
        // Success callback
        // The decoded text should be the URL of the scan target (e.g. http://localhost:3000/scan/123)
        // We can just redirect to decodedText if it's a valid URL on our site
        
        try {
          const url = new URL(decodedText)
          if (url.pathname.startsWith("/scan/")) {
            scanner.clear()
            router.push(url.pathname)
          } else {
            setError("Mã QR không hợp lệ")
          }
        } catch (e) {
          setError("Mã QR không hợp lệ: Không thể đọc URL")
        }
      },
      (errorMessage) => {
        // Ignore regular scan errors (happens when no barcode found)
      }
    )

    return () => {
      scanner.clear().catch(console.error)
    }
  }, [router])

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      <div className="p-4 flex items-center border-b border-slate-800">
        <Link href="/dashboard" className="p-2 hover:bg-slate-800 rounded-full transition-colors mr-2">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-bold">Quét mã QR Thiết bị</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm aspect-square bg-slate-800 rounded-3xl overflow-hidden shadow-2xl relative border-2 border-slate-700">
          <div id="reader" className="w-full h-full"></div>
        </div>

        <p className="mt-8 text-center text-slate-400 max-w-xs">
          Đưa camera quét mã QR dán trên thân thiết bị y tế.
        </p>

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
