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
    department: "",
    status: "WORKING",
    riskScore: "LOW",
    purchaseDate: ""
  })

  useEffect(() => {
    // Fetch equipment data from a GET endpoint /api/equipment/[id]
    // Since we don't have that endpoint, let's just make a simple API route or use Server Action.
    // Actually, Server Components can pass data to Client Components. Let's convert this to handle that.
    // We'll fetch within the component using fetch since it's a client component.
    const getEq = async () => {
      try {
        const res = await fetch(`/api/equipment/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setFormData({
            name: data.name,
            department: data.department,
            status: data.status,
            riskScore: data.riskScore,
            purchaseDate: new Date(data.purchaseDate).toISOString().split('T')[0]
          })
        } else {
          alert('Không tìm thấy thiết bị')
          router.push('/dashboard/equipment')
        }
      } catch (e) {
        console.error(e)
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
      await updateEquipment(params.id, formData)
      router.push("/dashboard/equipment")
      router.refresh()
    } catch (err: any) {
      alert(err.message || "Đã xảy ra lỗi")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="p-8 text-center text-slate-500">Đang tải thông tin...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/equipment" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sửa Thiết Bị</h1>
          <p className="text-slate-500 dark:text-slate-400">Cập nhật thông tin thiết bị y tế</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tên thiết bị
            </label>
            <input
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              type="text"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Khoa / Phòng ban
              </label>
              <select
                required
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
              >
                <option value="CC">Cấp Cứu</option>
                <option value="HSTC">Hồi sức tích cực</option>
                <option value="NTH">Nội Tổng hợp</option>
                <option value="XN">Xét nghiệm</option>
                <option value="CDHA">Chẩn đoán hình ảnh</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Đánh giá rủi ro
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Trạng thái hoạt động
              </label>
              <select
                required
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
              >
                <option value="WORKING">Hoạt động (WORKING)</option>
                <option value="WARNING">Cảnh báo lỗi (WARNING)</option>
                <option value="BROKEN">Đang hỏng (BROKEN)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Ngày mua / Đưa vào sử dụng
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
