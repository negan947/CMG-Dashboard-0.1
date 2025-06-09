'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Mock data - in a real app, this would be fetched
const data = [
  { name: 'Google Ads', volume: 4000 },
  { name: 'Facebook Ads', volume: 3000 },
  { name: 'GA', volume: 2000 },
  { name: 'LinkedIn Ads', volume: 2780 },
  { name: 'Stripe', volume: 1890 },
];

export function DataVolumeChart() {
  return (
    <>
        <div className="p-4">
            <h3 className="text-lg font-semibold">Data Volume by Platform</h3>
            <p className="text-sm text-muted-foreground">Records/events pulled per platform (last 7 days).</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="volume" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
    </>
  );
} 