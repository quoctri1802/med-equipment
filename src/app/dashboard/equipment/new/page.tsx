"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewEquipmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      department: formData.get("department"),
      purchaseDate: formData.get("purchaseDate"),
    }

    try {
      const res = await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        router.push("/dashboard/equipment")
        router.refresh()
      } else {
        alert("Lỗi khi thêm thiết bị")
      }
    } catch (err) {
      alert("Đã xảy ra lỗi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thêm Thiết Bị Mới</h1>
        <p className="text-slate-500 dark:text-slate-400">Nhập thông tin thiết bị để quản lý và tạo mã QR</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tên thiết bị
            </label>
            <input
              required
              name="name"
              type="text"
              placeholder="VD: Máy đo huyết áp điện tử Omron"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Khoa / Phòng ban
            </label>
            <select
              required
              name="department"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
            >
              <option value="">Chọn Khoa</option>
              <option value="CC">Cấp Cứu</option>
              <option value="HSTC">Hồi sức tích cực</option>
              <option value="NTH">Nội Tổng hợp</option>
              <option value="XN">Xét nghiệm</option>
              <option value="CDHA">Chẩn đoán hình ảnh</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Ngày mua / Đưa vào sử dụng
            </label>
            <input
              required
              name="purchaseDate"
              type="date"
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
              {loading ? "Đang lưu..." : "Lưu thiết bị"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
