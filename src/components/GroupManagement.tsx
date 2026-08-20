"use client"

import { useState, useEffect } from "react"
import { FolderPlus, Trash2, Plus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

interface Group {
  id: string
  name: string
}

export default function GroupManagement() {
  const [groups, setGroups] = useState<Group[]>([])
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      setFetching(true)
      const res = await fetch("/api/groups")
      if (res.ok) {
        const data = await res.json()
        setGroups(data)
      } else {
        setError("Không thể tải danh sách nhóm")
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải dữ liệu")
    } finally {
      setFetching(false)
    }
  }

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      })

      const data = await res.json()

      if (res.ok) {
        setGroups(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
        setName("")
        setSuccess(`Đã thêm nhóm "${data.name}" thành công!`)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || "Không thể thêm nhóm mới")
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi thêm nhóm")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGroup = async (id: string, groupName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa nhóm "${groupName}"?`)) return

    try {
      setError(null)
      setSuccess(null)

      const res = await fetch(`/api/groups?id=${id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setGroups(prev => prev.filter(g => g.id !== id))
        setSuccess(`Đã xóa nhóm "${groupName}" thành công!`)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const data = await res.json()
        setError(data.error || "Không thể xóa nhóm")
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi xóa nhóm")
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-150 dark:border-slate-700/50 space-y-6">
      <h3 className="font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3 text-slate-900 dark:text-white">
        <FolderPlus className="w-5 h-5 text-blue-500" /> Quản lý Nhóm thiết bị
      </h3>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 text-sm bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl border border-red-100 dark:border-red-900/30 animate-shake">
          <AlertCircle className="w-4.5 h-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-sm bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 p-3.5 rounded-xl border border-green-100 dark:border-green-900/30">
          <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Add New Group Form */}
      <form onSubmit={handleAddGroup} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên nhóm mới..."
          className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10 active:scale-95 shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Thêm
        </button>
      </form>

      {/* Group List */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Danh sách nhóm hiện có</p>
        
        {fetching ? (
          <div className="flex justify-center items-center py-8 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">Chưa có nhóm thiết bị nào.</p>
        ) : (
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1 space-y-1">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-xl transition-colors group"
              >
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{group.name}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteGroup(group.id, group.name)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                  title="Xóa nhóm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
