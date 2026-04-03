"use client"

import { useState } from "react"
import { Search, Filter, Laptop, AlertCircle, CheckCircle, Info } from "lucide-react"
import EquipmentActions from "./EquipmentActions"

type Equipment = {
  id: string
  name: string
  code: string
  department: string
  status: string
  riskScore: string
  createdAt: Date
}

export default function EquipmentList({ initialEquipments }: { initialEquipments: Equipment[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [deptFilter, setDeptFilter] = useState("ALL")

  const departments = Array.from(new Set(initialEquipments.map(e => e.department)))

  const filteredEquipments = initialEquipments.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         eq.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || eq.status === statusFilter
    const matchesDept = deptFilter === "ALL" || eq.department === deptFilter
    
    return matchesSearch && matchesStatus && matchesDept
  })

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mã thiết bị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none min-w-[140px]"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="WORKING">Hoạt động</option>
              <option value="WARNING">Cảnh báo</option>
              <option value="BROKEN">Đang hỏng</option>
            </select>
          </div>

          <div className="relative">
            <select 
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="pl-4 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none min-w-[140px]"
            >
              <option value="ALL">Tất cả khoa</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Equipment Grid/Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-medium">Thiết bị</th>
                <th className="px-6 py-4 font-medium">Khoa / Phòng</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium">Mức độ rủi ro</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEquipments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                       <Info className="w-8 h-8 text-slate-300" />
                       <p>Không tìm thấy thiết bị nào khớp với bộ lọc</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEquipments.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                            eq.status === 'WORKING' ? 'bg-green-50 text-green-600 dark:bg-green-900/20' :
                            eq.status === 'WARNING' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20' :
                            'bg-red-50 text-red-600 dark:bg-red-900/20'
                        }`}>
                            <Laptop className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white uppercase text-[13px]">{eq.name}</div>
                          <div className="text-xs font-mono text-blue-600 dark:text-blue-400 mt-0.5">{eq.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                      {eq.department}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {eq.status === 'WORKING' && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                        {eq.status === 'WARNING' && <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />}
                        {eq.status === 'BROKEN' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                        <span className={`text-xs font-bold ${
                          eq.status === "WORKING" ? "text-green-700 dark:text-green-400" :
                          eq.status === "WARNING" ? "text-yellow-700 dark:text-yellow-400" :
                          "text-red-700 dark:text-red-400"
                        }`}>
                          {eq.status === 'WORKING' ? 'HOẠT ĐỘNG' : eq.status === 'WARNING' ? 'CẢNH BÁO' : 'ĐANG HỎNG'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        eq.riskScore === "LOW" ? "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800" :
                        eq.riskScore === "MEDIUM" ? "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800" :
                        "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800"
                      }`}>
                        {eq.riskScore} RISK
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <EquipmentActions id={eq.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
