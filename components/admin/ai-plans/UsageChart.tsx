'use client';

/**
 * Usage Chart Component
 * Display AI plans creation over time
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface UsageChartProps {
  data: Array<{
    _id: any;
    count: number;
    totalBudget: number;
    avgDays: number;
  }>;
  period: string;
}

export default function UsageChart({ data, period }: UsageChartProps) {
  // Transform data for chart
  const chartData = data.map((item) => {
    let label = '';
    
    if (item._id.day) {
      // Daily data
      label = `${item._id.day}/${item._id.month}`;
    } else if (item._id.week) {
      // Weekly data
      label = `W${item._id.week}`;
    } else {
      // Monthly data
      label = `T${item._id.month}/${item._id.year}`;
    }

    return {
      label,
      'Số kế hoạch': item.count,
      'Trung bình ngày': Math.round(item.avgDays * 10) / 10,
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Chưa có dữ liệu
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="label" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="Số kế hoạch" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ fill: '#3b82f6' }}
        />
        <Line 
          type="monotone" 
          dataKey="Trung bình ngày" 
          stroke="#8b5cf6" 
          strokeWidth={2}
          dot={{ fill: '#8b5cf6' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

