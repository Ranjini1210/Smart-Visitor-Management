import React, { useState } from 'react';
import { StatCard } from '../components/StatCard';
import {
  Users,
  Clock,
  Building2,
  TrendingUp,
  BarChart3,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [rangeFilter, setRangeFilter] = useState<'today' | '7days' | '30days'>('7days');

  const trafficTrendData = [
    { label: 'Mon', visits: 45, checkedIn: 40 },
    { label: 'Tue', visits: 62, checkedIn: 58 },
    { label: 'Wed', visits: 78, checkedIn: 72 },
    { label: 'Thu', visits: 90, checkedIn: 85 },
    { label: 'Fri', visits: 110, checkedIn: 102 },
    { label: 'Sat', visits: 35, checkedIn: 30 },
    { label: 'Sun', visits: 22, checkedIn: 20 }
  ];

  const deptData = [
    { name: 'Computer Science', count: 120 },
    { name: 'Administration', count: 85 },
    { name: 'Research Cell', count: 65 },
    { name: 'Electronics', count: 45 },
    { name: 'Facilities', count: 30 }
  ];

  const peakHourData = [
    { hour: '09 AM', count: 30 },
    { hour: '10 AM', count: 75 },
    { hour: '11 AM', count: 95 },
    { hour: '12 PM', count: 50 },
    { hour: '02 PM', count: 88 },
    { hour: '03 PM', count: 64 },
    { hour: '04 PM', count: 42 }
  ];

  const COLORS = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#0369a1'];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar with Date Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Campus Visitor Analytics</h2>
          <p className="text-xs text-slate-500">Comprehensive security insights and traffic metrics</p>
        </div>

        {/* Date Range Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {(['today', '7days', '30days'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRangeFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                rangeFilter === r ? 'bg-white text-sky-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r === 'today' ? 'Today' : r === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Visitors"
          value="1,420"
          change="+18.2%"
          description="Across selected period"
          icon={<Users className="w-6 h-6 text-sky-600" />}
          accentColor="bg-sky-50"
        />

        <StatCard
          title="Avg Visit Duration"
          value="1h 45m"
          change="Optimal"
          description="Average time spent on campus"
          icon={<Clock className="w-6 h-6 text-emerald-600" />}
          accentColor="bg-emerald-50"
        />

        <StatCard
          title="Top Visited Dept"
          value="CS & Engg"
          description="34% of overall traffic"
          icon={<Building2 className="w-6 h-6 text-indigo-600" />}
          accentColor="bg-indigo-50"
        />

        <StatCard
          title="Approval Rate"
          value="96.4%"
          change="High trust"
          description="Percentage of approved requests"
          icon={<CheckCircle2 className="w-6 h-6 text-sky-600" />}
          accentColor="bg-sky-50"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Visitor Traffic */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <h3 className="font-extrabold text-base text-slate-900 mb-1">Visitor Traffic Trend</h3>
          <p className="text-xs text-slate-500 mb-6">Registered visits vs Checked-in visitors</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="visits" fill="#0284c7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="checkedIn" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Visiting Hours */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <h3 className="font-extrabold text-base text-slate-900 mb-1">Peak Visiting Hours</h3>
          <p className="text-xs text-slate-500 mb-6">Hourly distribution of visitor entry traffic</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={peakHourData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#0284c7" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department-Wise Visitors */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <h3 className="font-extrabold text-base text-slate-900 mb-1">Department-Wise Traffic</h3>
          <p className="text-xs text-slate-500 mb-6">Volume of visitors per campus department</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#334155' }} width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#0369a1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
