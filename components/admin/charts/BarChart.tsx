'use client';

/**
 * Reusable Bar Chart Component
 * Using Recharts library
 */

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: any[];
  dataKeys: { key: string; color: string; name: string }[];
  xKey: string;
  height?: number;
}

export function BarChart({ data, dataKeys, xKey, height = 300 }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {dataKeys.map((dk) => (
          <Bar key={dk.key} dataKey={dk.key} fill={dk.color} name={dk.name} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

