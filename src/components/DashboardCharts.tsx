"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

const COLORS = {
  "Sẵn sàng": '#22c55e',       // green-500
  "Cần hiệu chuẩn": '#eab308', // yellow-500
  "Sự cố / Hỏng": '#ef4444'     // red-500
}

export function StatusPieChart({ data }: { data: { status: string, _count: { status: number } }[] }) {
  const chartData = data.map(d => ({
    name: d.status,
    value: d._count.status
  }))

  return (
    <div className="h-64 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          <Legend formatter={(value) => <span className="text-xs font-bold text-slate-600 dark:text-slate-450">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RiskBarChart({ data }: { data: { riskScore: string, _count: { riskScore: number } }[] }) {
  const riskLabels: Record<string, string> = {
    LOW: "Thấp",
    MEDIUM: "Trung bình",
    HIGH: "Cao"
  }
  const riskColors: Record<string, string> = {
    "Thấp": "#3b82f6",     // blue
    "Trung bình": "#f97316", // orange
    "Cao": "#ef4444"        // red
  }
  
  const chartData = data.map(d => ({
    name: riskLabels[d.riskScore] || d.riskScore,
    value: d._count.riskScore
  }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold' }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip cursor={{fill: 'rgba(59, 130, 246, 0.05)'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Số lượng" barSize={36}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={riskColors[entry.name] || '#8884d8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
