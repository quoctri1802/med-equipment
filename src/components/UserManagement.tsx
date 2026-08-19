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
  const [users, setUsers] = useState(initialUsers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  
  // Form states
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "STAFF", permissions: "", department: "XN" })
  const [loading, setLoading] = useState(false)
  const [errorMSG, setErrorMSG] = useState("")

  const openAddModal = () => {
    setEditingUser(null)
    setFormData({ name: "", email: "", password: "", role: "STAFF", permissions: "", department: "XN" })
    setErrorMSG("")
    setIsModalOpen(true)
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setFormData({ 
      name: user.name || "", 
      email: user.email || "", 
      password: "", 
      role: user.role, 
      permissions: user.permissions || "",
      department: "XN" // Enforced
    })
    setErrorMSG("")
    setIsModalOpen(true)
  }

  const handleDelete = async (id, email) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản " + email + "?")) return
    
    try {
      const res = await deleteUser(id)
      if (res.success) {
        setUsers(prev => prev.filter(u => u.id !== id))
      } else {
        alert("Xóa tài khoản thất bại")
      }
    } catch (err) {
      alert(err.message || "Lỗi khi xóa tài khoản")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMSG("")

    try {
      if (editingUser) {
        const res = await updateUser(editingUser.id, formData)
        if (res.success) {
          setUsers(prev => prev.map(u => u.id === editingUser.id ? res.user : u))
          setIsModalOpen(false)
        } else {
          setErrorMSG(res.error || "Cập nhật thất bại")
        }
      } else {
        const res = await createUser(formData)
        if (res.success) {
          setUsers(prev => [...prev, res.user])
          setIsModalOpen(false)
        } else {
          setErrorMSG(res.error || "Tạo tài khoản thất bại")
        }
      }
    } catch (err) {
      setErrorMSG(err.message || "Đã xảy ra lỗi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-md border border-slate-100 dark:border-slate-700">
        <h3 className="font-extrabold text-sm uppercase text-slate-800 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" /> Quản lý danh sách người dùng
        </h3>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-500/10 active:scale-95"
        >
          + Thêm tài khoản
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-150 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-bold">Họ và tên</th>
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold">Vai trò</th>
                <th className="px-6 py-4 font-bold">Ngày tạo</th>
                <th className="px-6 py-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-105 dark:divide-slate-800/80">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10 transition-colors">
                  <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-white uppercase text-xs">
                    {u.name || "--"}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                    {u.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className={"px-2.5 py-0.5 rounded-full text-[9px] font-black border " + (
                      u.role === "ADMIN" ? "bg-red-50 text-red-700 border-red-200" :
                      u.role === "TECHNICIAN" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-slate-50 text-slate-700 border-slate-200"
                    )}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-semibold">
                    {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                    <button onClick={() => openEditModal(u)} className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer">
                      <Edit className="w-4 h-4"/> Sửa
                    </button>
                    <button onClick={() => handleDelete(u.id, u.email)} className="text-red-550 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer">
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
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-sm">
                {editingUser ? "Chỉnh sửa tài khoản" : "Tạo tài khoản mới"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMSG && <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold">{errorMSG}</div>}
              
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5">Họ và Tên</label>
                <input 
                  required
                  type="text" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm focus:border-blue-500 outline-none dark:bg-slate-900 dark:text-white transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5">Email</label>
                <input 
                  required
                  type="email" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm focus:border-blue-500 outline-none dark:bg-slate-900 dark:text-white transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5">
                  Mật khẩu {editingUser && <span className="text-[10px] text-slate-400 font-normal font-sans">(Bỏ trống nếu không đổi)</span>}
                </label>
                <input 
                  required={!editingUser}
                  type="password" 
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm focus:border-blue-500 outline-none dark:bg-slate-900 dark:text-white transition-all font-semibold"
                />
              </div>

               <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5">Vai trò quản lý</label>
                <select 
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm focus:border-blue-500 outline-none dark:bg-slate-900 dark:text-white transition-all font-bold"
                >
                  <option value="STAFF">STAFF (Nhân viên khoa)</option>
                  <option value="TECHNICIAN">TECHNICIAN (Kỹ thuật viên QC)</option>
                  <option value="ADMIN">ADMIN (Quản trị viên)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Quy kết phân quyền (Permissions)</label>
                <div className="space-y-2 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/30">
                  <PermissionCheckbox label="Xem Thiết Bị" permKey="EQUIPMENT_VIEW" formData={formData} setFormData={setFormData} />
                  <PermissionCheckbox label="Chỉnh sửa/Xóa Thiết Bị" permKey="EQUIPMENT_EDIT" formData={formData} setFormData={setFormData} />
                  <PermissionCheckbox label="Quản lý Bảo Trì" permKey="MAINTENANCE_MANAGE" formData={formData} setFormData={setFormData} />
                  <PermissionCheckbox label="Xem Báo Cáo & Kiểm kê" permKey="REPORT_VIEW" formData={formData} setFormData={setFormData} />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-700/80">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-350 dark:hover:bg-slate-700 transition">
                  Hủy
                </button>
                <button disabled={loading} type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10">
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

function PermissionCheckbox({ label, permKey, formData, setFormData }) {
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
    <label className="flex items-center gap-2.5 cursor-pointer p-1">
      <input type="checkbox" checked={hasPerm} onChange={toggle} className="w-4 h-4 text-blue-600 rounded border-slate-305 focus:ring-blue-500" />
      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
    </label>
  )
}
