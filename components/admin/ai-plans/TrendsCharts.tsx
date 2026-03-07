'use client';

/**
 * Trends Charts Component
 * Display travel trends (budget, styles, interests)
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#14b8a6'];

interface TrendsChartsProps {
  budgetTrends: Array<{ _id: number; count: number; label: string }>;
  travelStyles: Array<{ _id: string; count: number }>;
  popularInterests: Array<{ _id: string; count: number }>;
}

export default function TrendsCharts({ budgetTrends, travelStyles, popularInterests }: TrendsChartsProps) {
  // Budget data
  const budgetData = budgetTrends.map((item) => ({
    name: item.label || 'Khác',
    value: item.count,
  }));

  // Travel styles data
  const stylesData = travelStyles.map((item) => ({
    name: item._id || 'Chưa xác định',
    value: item.count,
  }));

  // Interests data
  const interestsData = popularInterests.slice(0, 8).map((item) => ({
    name: item._id || 'Khác',
    value: item.count,
  }));

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Budget Distribution */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-center">Phân bổ ngân sách</h3>
        {budgetData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={budgetData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {budgetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Chưa có dữ liệu
          </div>
        )}
      </div>

      {/* Travel Styles */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-center">Phong cách du lịch</h3>
        {stylesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stylesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stylesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Chưa có dữ liệu
          </div>
        )}
      </div>

      {/* Popular Interests */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-center">Sở thích phổ biến</h3>
        {interestsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={interestsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {interestsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Chưa có dữ liệu
          </div>
        )}
      </div>
    </div>
  );
}

