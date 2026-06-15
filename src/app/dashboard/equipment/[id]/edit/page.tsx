"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updateEquipment } from "@/app/actions/equipment"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function EditEquipmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    department: "",
    status: "WORKING",
    riskScore: "LOW",
    purchaseDate: "",
    model: "",
    serialNumber: "",
    brand: "",
    origin: "",
    contactInfo: "",
    usageNotes: "",
    qcTechnician: ""
  })

  useEffect(() => {
    const getEq = async () => {
      try {
        const res = await fetch(`/api/equipment/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setFormData({
            name: data.name,
            code: data.code || "",
            department: data.department,
            status: data.status,
            riskScore: data.riskScore,
            purchaseDate: new Date(data.purchaseDate).toISOString().split('T')[0],
            model: data.model || "",
            serialNumber: data.serialNumber || "",
            brand: data.brand || "",
            origin: data.origin || "",
            contactInfo: data.contactInfo || "",
            usageNotes: data.usageNotes || "",
            qcTechnician: data.qcTechnician || ""
          })
        } else {
          alert('Không tìm thấy thiết bị')
          router.push('/dashboard/equipment')
        }
      } catch (err) {
        alert('Lỗi tải dữ liệu thiết bị')
      } finally {
        setFetching(false)
      }
    }
    getEq()
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await updateEquipment(params.id, formData)
      if (res.success) {
        router.push(`/dashboard/equipment/${params.id}`)
        router.refresh()
      } else {
        alert('Lỗi khi cập nhật thiết bị')
      }
    } catch (err: any) {
      alert(err.message || 'Đã xảy ra lỗi')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="text-center py-20 text-slate-500">Đang tải dữ liệu thiết bị...</div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link href={`/dashboard/equipment/${params.id}`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Chỉnh Sửa Hồ Sơ Thiết Bị</h1>
          <p className="text-slate-500 dark:text-slate-400">Cập nhật thông tin chi tiết và trạng thái vận hành</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tên thiết bị <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                type="text"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Mã số thiết bị <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
                type="text"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Model
              </label>
              <input
                value={formData.model}
                onChange={e => setFormData({...formData, model: e.target.value})}
                type="text"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Số serial
              </label>
              <input
                value={formData.serialNumber}
                onChange={e => setFormData({...formData, serialNumber: e.target.value})}
                type="text"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Hãng sản xuất
              </label>
              <input
                value={formData.brand}
                onChange={e => setFormData({...formData, brand: e.target.value})}
                type="text"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nước sản xuất
              </label>
              <input
                value={formData.origin}
                onChange={e => setFormData({...formData, origin: e.target.value})}
                type="text"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Khoa / Phòng ban <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
              >
                <option value="CC">Khoa Cấp cứu</option>
                <option value="HSTC">Hồi sức tích cực</option>
                <option value="NTH">Nội tổng hợp</option>
                <option value="XN">Khoa Xét nghiệm</option>
                <option value="CDHA">Chẩn đoán hình ảnh</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Thời gian nhận máy / đưa vào sử dụng <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={formData.purchaseDate}
                onChange={e => setFormData({...formData, purchaseDate: e.target.value})}
                type="date"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Trạng thái hoạt động <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
              >
                <option value="WORKING">Sẵn sàng / Vận hành (WORKING)</option>
                <option value="WARNING">Cần hiệu chuẩn (WARNING)</option>
                <option value="BROKEN">Sự cố / Hỏng (BROKEN)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Đánh giá rủi ro <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.riskScore}
                onChange={e => setFormData({...formData, riskScore: e.target.value})}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
              >
                <option value="LOW">Thấp (LOW)</option>
                <option value="MEDIUM">Trung bình (MEDIUM)</option>
                <option value="HIGH">Cao (HIGH)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                KTV hiệu chuẩn QC
              </label>
              <input
                value={formData.qcTechnician}
                onChange={e => setFormData({...formData, qcTechnician: e.target.value})}
                type="text"
                placeholder="VD: KTV. Nguyễn Văn A"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Thông tin liên hệ nhà phân phối / sản xuất
              </label>
              <input
                value={formData.contactInfo}
                onChange={e => setFormData({...formData, contactInfo: e.target.value})}
                type="text"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Lưu ý, yêu cầu khi sử dụng
            </label>
            <textarea
              value={formData.usageNotes}
              onChange={e => setFormData({...formData, usageNotes: e.target.value})}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-colors"
            >
              {loading ? "Đang lưu..." : "Cập nhật thiết bị"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
