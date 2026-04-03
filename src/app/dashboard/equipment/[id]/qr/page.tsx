import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import Link from "next/link"
import { ArrowLeft, Printer } from "lucide-react"

const prisma = new PrismaClient()

export default async function EquipmentQRPage({ params }: { params: { id: string } }) {
  const equipment = await prisma.equipment.findUnique({
    where: { id: params.id }
  })

  if (!equipment) {
    notFound()
  }

  // Domain url for the QR code to point to
  // In production, use NEXT_PUBLIC_SITE_URL
  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const scanTarget = `${siteUrl}/scan/${equipment.id}`

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard/equipment" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </Link>
        <button 
          className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
          // window.print() will be implemented via client component if needed, or just let users use Ctrl+P
        >
          <Printer className="w-5 h-5" />
          In Mã QR
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center" id="printable-qr">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{equipment.name}</h2>
        <p className="font-mono text-slate-500 dark:text-slate-400 mb-8">{equipment.code}</p>

        <div className="flex justify-center mb-8">
          <div className="p-4 bg-white border-4 border-slate-100 rounded-2xl">
            <QRCodeSVG 
              value={scanTarget} 
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Quét mã QR này để truy cập thông tin chi tiết và cập nhật báo cáo hằng ngày cho thiết bị trên.
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
            }
          }
        `
      }} />
    </div>
  )
}
