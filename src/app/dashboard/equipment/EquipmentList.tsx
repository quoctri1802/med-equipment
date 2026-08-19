"use client"

import { useState } from "react"
import { Search, Filter, FlaskConical, AlertCircle, CheckCircle, Info } from "lucide-react"
import EquipmentActions from "./EquipmentActions"

type Equipment = {
  id: string
  name: string
  code: string
  department: string
  status: string
  riskScore: string
  model: string | null
  serialNumber: string | null
  brand: string | null
  origin: string | null
  qcTechnician: string | null
  createdAt: Date
}

export default function EquipmentList({ initialEquipments }: { initialEquipments: Equipment[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  const filteredEquipments = initialEquipments.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         eq.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (eq.model && eq.model.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "ALL" || eq.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-md border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text"
            placeholder="Tìm kiếm máy xét nghiệm theo tên, mã số, model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-900 dark:text-white"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-11 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none min-w-[180px] font-medium text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="WORKING">Sẵn sàng / Vận hành</option>
              <option value="WARNING">Cần hiệu chuẩn</option>
              <option value="BROKEN">Sự cố / Hỏng</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-400 w-0 h-0" />
          </div>
        </div>
      </div>

      {/* Equipment Table Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/70 dark:bg-slate-900/50 dark:text-slate-400 border-b border-slate-150 dark:border-slate-700">
              <tr>
                <th className="px-6 py-5 font-bold tracking-wider">Thiết bị xét nghiệm</th>
                <th className="px-6 py-5 font-bold tracking-wider">Model</th>
                <th className="px-6 py-5 font-bold tracking-wider">QC / Hiệu chuẩn</th>
                <th className="px-6 py-5 font-bold tracking-wider">Trạng thái</th>
                <th className="px-6 py-5 font-bold tracking-wider">Mức rủi ro</th>
                <th className="px-6 py-5 font-bold tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredEquipments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                       <Info className="w-10 h-10 text-slate-300" />
                       <p className="font-medium text-slate-400">Không tìm thấy máy xét nghiệm nào khớp bộ lọc</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEquipments.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/10 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl transition-all duration-300 ${
                            eq.status === 'WORKING' ? 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400' :
                            eq.status === 'WARNING' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400' :
                            'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                        }`}>
                            <FlaskConical className="w-5.5 h-5.5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white uppercase text-[13px] tracking-tight">{eq.name}</div>
                          <div className="text-xs font-semibold font-mono text-blue-600 dark:text-blue-400 mt-1">{eq.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-semibold text-slate-700 dark:text-slate-300">
                      {eq.model || '--'}
                    </td>
                    <td className="px-6 py-5 font-semibold text-slate-650 dark:text-slate-300">
                      {eq.qcTechnician || '--'}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {eq.status === 'WORKING' && <CheckCircle className="w-4 h-4 text-green-550" />}
                        {eq.status === 'WARNING' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                        {eq.status === 'BROKEN' && <AlertCircle className="w-4 h-4 text-red-500" />}
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                          eq.status === "WORKING" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800" :
                          eq.status === "WARNING" ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-450 dark:border-yellow-800" :
                          "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800"
                        }`}>
                          {eq.status === 'WORKING' ? 'SẴN SÀNG' : eq.status === 'WARNING' ? 'CẦN HIỆU CHUẨN' : 'SỰ CỐ / HỎNG'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                        eq.riskScore === "LOW" ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-800/50" :
                        eq.riskScore === "MEDIUM" ? "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-800/50" :
                        "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800/50"
                      }`}>
                        {eq.riskScore} RISK
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
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
