"use client"

import { useState } from "react"
import { Users, X, Trash2, Edit } from "lucide-react"
import { createUser, updateUser, deleteUser } from "@/app/actions/user"

type User = {
  id: string
  name: string | null
  email: string | null
  role: string
  department?: string | null
  createdAt: Date
}

export default function UserManagement({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  
  // Form states
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "STAFF", permissions: "", department: "" })
  const [loading, setLoading] = useState(false)
  const [errorMSG, setErrorMSG] = useState("")

  const openAddModal = () => {
    setEditingUser(null)
    setFormData({ name: "", email: "", password: "", role: "STAFF", permissions: "", department: "" })
    setErrorMSG("")
    setIsModalOpen(true)
  }

  const openEditModal = (user: any) => {
    setEditingUser(user)
    setFormData({ 
      name: user.name || "", 
      email: user.email || "", 
      password: "", 
      role: user.role, 
      permissions: user.permissions || "",
      department: user.department || ""
    })
    setErrorMSG("")
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, email: string | null) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản ${email}?`)) return
    
    try {
      const res = await deleteUser(id)
      if (res.success) {
        setUsers(prev => prev.filter(u => u.id !== id))
      } else {
        alert("Xóa tài khoản thất bại")
      }
    } catch (err: any) {
      alert(err.message || "Lỗi khi xóa tài khoản")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMSG("")

    try {
      if (editingUser) {
        const res = await updateUser(editingUser.id, formData)
        if (res.success && res.user) {
          const updated = res.user as User
          setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
          setIsModalOpen(false)
        }
      } else {
        const res = await createUser(formData)
        if (res.success && res.user) {
          const created = res.user as User
          setUsers(prev => [created, ...prev])
          setIsModalOpen(false)
        }
      }
    } catch (err: any) {
      setErrorMSG(err.message || "Lỗi khi lưu thông tin tài khoản")
    } finally {
      setLoading(false)
    }
  }

  // Map department codes to readable labels
  const getDeptLabel = (code: string | null | undefined) => {
    if (!code) return "Không phân khoa";
    if (code === "ALL") return "Tất cả khoa";
    const deptLabels: Record<string, string> = {
      CC: "Khoa Cấp cứu",
      HSTC: "Hồi sức tích cực",
      NTH: "Nội tổng hợp",
      XN: "Khoa Xét nghiệm",
      CDHA: "Chẩn đoán hình ảnh"
    }
    return deptLabels[code] || code;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-500" /> Quản lý Người dùng hệ thống
        </h2>
        <button onClick={openAddModal} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
          + Thêm Tài khoản
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 font-semibold">Họ và Tên / Email</th>
                <th className="px-6 py-3 font-semibold">Vai trò</th>
                <th className="px-6 py-3 font-semibold">Khoa phụ trách</th>
                <th className="px-6 py-3 font-semibold">Ngày tạo</th>
                <th className="px-6 py-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-950 dark:text-white">{u.name || "N/A"}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      u.role === "ADMIN" ? "bg-red-50 text-red-600 border-red-200" :
                      u.role === "TECHNICIAN" ? "bg-amber-50 text-amber-600 border-amber-200" :
                      "bg-blue-50 text-blue-600 border-blue-200"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                    {getDeptLabel(u.department)}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                    <button onClick={() => openEditModal(u)} className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline flex items-center gap-1">
                      <Edit className="w-4 h-4"/> Sửa
                    </button>
                    <button onClick={() => handleDelete(u.id, u.email)} className="text-red-500 hover:text-red-700 font-medium cursor-pointer flex items-center gap-1">
                      <Trash2 className="w-4 h-4"/> Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {editingUser ? "Chỉnh sửa tài khoản" : "Tạo tài khoản mới"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMSG && <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">{errorMSG}</div>}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Họ và Tên</label>
                <input 
                  required
                  type="text" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input 
                  required
                  type="email" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Mật khẩu {editingUser && <span className="text-xs text-slate-400 font-normal">(Bỏ trống nếu không đổi)</span>}
                </label>
                <input 
                  required={!editingUser}
                  type="password" 
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

               <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vai trò</label>
                <select 
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <option value="STAFF">STAFF (Nhân viên)</option>
                  <option value="TECHNICIAN">TECHNICIAN (Kỹ thuật viên)</option>
                  <option value="ADMIN">ADMIN (Quản trị viên)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Khoa / Phòng phụ trách</label>
                <select 
                  value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <option value="">Không phân khoa</option>
                  <option value="ALL">Tất cả khoa (ADMIN)</option>
                  <option value="CC">Khoa Cấp cứu</option>
                  <option value="HSTC">Hồi sức tích cực</option>
                  <option value="NTH">Nội tổng hợp</option>
                  <option value="XN">Khoa Xét nghiệm</option>
                  <option value="CDHA">Chẩn đoán hình ảnh</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Quyền hạn (Permissions)</label>
                <div className="space-y-2 border border-slate-200 dark:border-slate-700 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/30">
                  <PermissionCheckbox label="Xem Thiết Bị" permKey="EQUIPMENT_VIEW" formData={formData} setFormData={setFormData} />
                  <PermissionCheckbox label="Chỉnh sửa/Xóa Thiết Bị" permKey="EQUIPMENT_EDIT" formData={formData} setFormData={setFormData} />
                  <PermissionCheckbox label="Quản lý Bảo Trí" permKey="MAINTENANCE_MANAGE" formData={formData} setFormData={setFormData} />
                  <PermissionCheckbox label="Xem Báo Cáo & Kiểm kê" permKey="REPORT_VIEW" formData={formData} setFormData={setFormData} />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition">
                  Hủy
                </button>
                <button disabled={loading} type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition">
                  {loading ? "Đang xử lý..." : "Lưu lại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function PermissionCheckbox({ label, permKey, formData, setFormData }: { label: string, permKey: string, formData: any, setFormData: any }) {
  const currentPerms = formData.permissions ? formData.permissions.split(',') : []
  const hasPerm = currentPerms.includes(permKey)

  const toggle = () => {
    let nextPerms = [...currentPerms]
    if (hasPerm) {
      nextPerms = nextPerms.filter(k => k !== permKey && k.trim() !== '')
    } else {
      nextPerms.push(permKey)
    }
    setFormData({ ...formData, permissions: nextPerms.join(',') })
  }

  return (
    <label className="flex items-center gap-2 cursor-pointer p-1">
      <input type="checkbox" checked={hasPerm} onChange={toggle} className="w-4 h-4 text-blue-600 rounded" />
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    </label>
  )
}
