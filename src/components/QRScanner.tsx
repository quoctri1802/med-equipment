"use client"

import { useEffect, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"

interface QRScannerProps {
  onScanSuccess: (decodedText: string, scanner: Html5QrcodeScanner) => void
  onError?: (error: string) => void
}

export default function QRScanner({ onScanSuccess, onError }: QRScannerProps) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (text) => onScanSuccess(text, scanner),
      (err) => {
        // Ignore constant scan errors
      }
    )

    return () => {
      scanner.clear().catch(console.error)
    }
  }, [onScanSuccess])

  return (
    <div id="reader" className="w-full h-full"></div>
  )
}
