import { notFound } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import PrintQRButton from "@/components/PrintQRButton"

import prisma from "@/lib/prisma"

export default async function EquipmentQRPage({ params }: { params: { id: string } }) {
  const equipment = await prisma.equipment.findUnique({
    where: { id: params.id }
  })

  if (!equipment) {
    notFound()
  }

  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const scanTarget = `${siteUrl}/scan/${equipment.id}`

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard/equipment" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold">Quay lại</span>
        </Link>
        <PrintQRButton />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-150 dark:border-slate-700/60 p-8 text-center" id="printable-qr">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">{equipment.name}</h2>
        <p className="font-mono text-slate-400 dark:text-slate-500 font-bold mb-8">{equipment.code}</p>

        <div className="flex justify-center mb-8">
          <div className="p-5 bg-white border-4 border-slate-100 rounded-3xl shadow-inner shadow-slate-100">
            <QRCodeSVG 
              value={scanTarget} 
              size={220}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">
          Quét mã QR này để truy cập thông tin chi tiết và cập nhật báo cáo hàng ngày cho thiết bị trên.
        </p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-qr, #printable-qr * {
              visibility: visible;
            }
            #printable-qr {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              border: none;
              box-shadow: none;
              background: white !important;
              color: black !important;
            }
          }
        `
      }} />
    </div>
  )
}
