"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewEquipmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [groups, setGroups] = useState<{ id: string, name: string }[]>([])

  useEffect(() => {
    fetch("/api/groups")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setGroups(data)
        }
      })
      .catch(err => console.error("Error loading groups:", err))
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      code: formData.get("code"),
      department: "XN", // Mặc định Khoa Xét Nghiệm
      purchaseDate: formData.get("purchaseDate"),
      model: formData.get("model"),
      serialNumber: formData.get("serialNumber"),
      brand: formData.get("brand"),
      origin: formData.get("origin"),
      contactInfo: formData.get("contactInfo"),
      usageNotes: formData.get("usageNotes"),
      qcTechnician: formData.get("qcTechnician"),
      testGroup: formData.get("testGroup"),
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/dashboard/equipment" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thêm Thiết Bị Mới</h1>
          <p className="text-slate-500 dark:text-slate-400">Nhập thông tin máy xét nghiệm để quản lý hồ sơ và tạo mã QR</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Tên thiết bị xét nghiệm <span className="text-red-500">*</span>
              </label>
              <input
                required
                name="name"
                type="text"
                placeholder="VD: Máy phân tích sinh hóa Roche Cobas c501"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Mã số thiết bị (Hệ thống tự tạo nếu để trống)
              </label>
              <input
                name="code"
                type="text"
                placeholder="VD: XN-SH-20260615-001"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Model
              </label>
              <input
                name="model"
                type="text"
                placeholder="VD: Cobas c501"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Số serial
              </label>
              <input
                name="serialNumber"
                type="text"
                placeholder="VD: SN12345678"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Hãng sản xuất
              </label>
              <input
                name="brand"
                type="text"
                placeholder="VD: Roche Diagnostics"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Nước sản xuất
              </label>
              <input
                name="origin"
                type="text"
                placeholder="VD: Đức"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                KTV hiệu chuẩn QC
              </label>
              <input
                name="qcTechnician"
                type="text"
                placeholder="VD: KTV. Nguyễn Văn A"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Ngày nhận / đưa vào sử dụng <span className="text-red-500">*</span>
              </label>
              <input
                required
                name="purchaseDate"
                type="date"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none text-slate-750"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Nhóm xét nghiệm
              </label>
              <select
                name="testGroup"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
              >
                <option value="">-- Chọn nhóm xét nghiệm --</option>
                {groups.map(g => (
                  <option key={g.id} value={g.name}>{g.name}</option>
                ))}
              </select>
            </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Thông tin liên hệ nhà phân phối / sản xuất
            </label>
            <input
              name="contactInfo"
              type="text"
              placeholder="VD: Cty TNHH Thiết bị Y Tế ABC - SĐT: 0909123456"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Lưu ý, yêu cầu khi sử dụng
            </label>
            <textarea
              name="usageNotes"
              rows={3}
              placeholder="VD: Cân bằng ống ly tâm đối xứng trước khi vận hành, vệ sinh buồng ly tâm sau khi sử dụng..."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-350 rounded-xl hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 active:scale-95"
            >
              {loading ? "Đang lưu..." : "Lưu thiết bị"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
