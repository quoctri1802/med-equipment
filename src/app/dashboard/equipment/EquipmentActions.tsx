"use client"

import Link from "next/link"
import { QrCode, Edit, Trash2, FileText } from "lucide-react"
import { deleteEquipment } from "@/app/actions/equipment"
import { useRouter } from "next/navigation"

export default function EquipmentActions({ id }: { id: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Xóa thiết bị này sẽ xóa toàn bộ lịch sử lỗi và bảo trì. Bạn chắc chắn chứ?")) return
    
    try {
      await deleteEquipment(id)
      router.refresh()
    } catch (e: any) {
      alert("Lỗi: " + e.message)
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <Link href={`/dashboard/equipment/${id}`} title="Chi tiết" className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
        <FileText className="w-5 h-5" /> 
      </Link>
      <Link href={`/dashboard/equipment/${id}/qr`} title="Mã QR" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
        <QrCode className="w-5 h-5" />
      </Link>
      <Link href={`/dashboard/equipment/${id}/edit`} title="Sửa" className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
        <Edit className="w-5 h-5" />
      </Link>
      <button onClick={handleDelete} title="Xóa" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  )
}
