'use client';

/**
 * Destinations Chart Component
 * Display top destinations in AI plans
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DestinationsChartProps {
  data: Array<{
    _id: string;
    name: string;
    count: number;
    avgBudget: number;
    avgDays: number;
  }>;
}

export default function DestinationsChart({ data }: DestinationsChartProps) {
  const chartData = data.map((item) => ({
    name: item.name,
    'Số lần xuất hiện': item.count,
    'Ngân sách TB (tr)': Math.round(item.avgBudget / 100000) / 10,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Chưa có dữ liệu
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={100}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Số lần xuất hiện" fill="#3b82f6" />
        <Bar dataKey="Ngân sách TB (tr)" fill="#8b5cf6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

