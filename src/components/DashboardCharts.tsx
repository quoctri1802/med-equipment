"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

const COLORS = {
  WORKING: '#22c55e',   // green-500
  WARNING: '#eab308',   // yellow-500
  BROKEN: '#ef4444'     // red-500
}

export function StatusPieChart({ data }: { data: { status: string, _count: { status: number } }[] }) {
  const chartData = data.map(d => ({
    name: d.status,
    value: d._count.status
  }))

  return (
    <div className="h-64 w-full">
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
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DepartmentBarChart({ data }: { data: { department: string, _count: { department: number } }[] }) {
  const chartData = data.map(d => ({
    name: d.department,
    value: d._count.department
  }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip cursor={{fill: 'transparent'}} />
          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Số lượng thiết bị" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
