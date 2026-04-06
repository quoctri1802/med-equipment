"use client"

import React, { useEffect, useState, useRef } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"

interface QRScannerProps {
  onScanSuccess: (decodedText: string, scanner: Html5QrcodeScanner) => void
  onError?: (error: string) => void
}

export default function QRScanner({ onScanSuccess, onError }: QRScannerProps) {
  const scanHandlerRef = useRef(onScanSuccess)

  // Cập nhật ref mỗi khi callback thay đổi
  useEffect(() => {
    scanHandlerRef.current = onScanSuccess
  }, [onScanSuccess])

  useEffect(() => {
    // Chỉ khởi tạo khi component mount
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        // Ưu tiên camera sau (environment)
        videoConstraints: {
          facingMode: "environment"
        }
      },
      /* verbose= */ false
    );

    scanner.render(
      (text) => scanHandlerRef.current(text, scanner),
      (err) => {
        // Lỗi này xảy ra liên tục khi không thấy mã QR, bỏ qua
      }
    )

    return () => {
      // Làm sạch scanner khi unmount
      scanner.clear().catch(err => {
        console.error("Lỗi khi dừng QR Scanner:", err);
      });
    }
  }, []); // Cực kỳ quan trọng: Dependency array rỗng để chỉ chạy 1 lần

  return (
    <div id="reader" className="w-full h-full"></div>
  )
}
