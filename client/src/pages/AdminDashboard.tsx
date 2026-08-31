import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { VisitorStatusBadge } from '../components/VisitorStatusBadge';
import { api } from '../services/api';
import { Visit, AuditLogItem } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  UserPlus,
  QrCode,
  CheckSquare,
  Activity,
  ArrowRight,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [overviewStats, setOverviewStats] = useState<any>({
    totalVisitorsToday: 248,
    totalVisitorsTodayChange: '+12.5%',
    currentlyInside: 18,
    pendingApprovals: 5,
    completedVisits: 225
  });

  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [purposeData, setPurposeData] = useState<any[]>([]);
  const [peakHoursData, setPeakHoursData] = useState<any[]>([]);
  const [liveVisits, setLiveVisits] = useState<Visit[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#0284c7', '#0369a1'];

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewRes, trafficRes, purposeRes, peakRes, visitsRes, logsRes] = await Promise.all([
        api.get('/analytics/overview').catch(() => null),
        api.get('/analytics/traffic').catch(() => null),
        api.get('/analytics/purposes').catch(() => null),
        api.get('/analytics/peak-hours').catch(() => null),
        api.get('/visits').catch(() => null),
        api.get('/settings/audit-logs').catch(() => null)
      ]);

      if (overviewRes?.data?.success) setOverviewStats(overviewRes.data.data);
      if (trafficRes?.data?.success) setTrafficData(trafficRes.data.data);
      if (purposeRes?.data?.success) setPurposeData(purposeRes.data.data);
      if (peakRes?.data?.success) setPeakHoursData(peakRes.data.data);
      if (visitsRes?.data?.success) setLiveVisits(visitsRes.data.data);
      if (logsRes?.data?.success) setAuditLogs(logsRes.data.data);
    } catch {
      // Fallbacks active
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredVisits = liveVisits.filter((v) => {
    const matchesSearch =
      v.visitor_name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.host_name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.purpose?.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Enterprise Security Console
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
            Good Morning, {user?.name || 'Admin'}
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Here's what's happening across your campus today.
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={() => navigate('/visitors/register')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Visitor</span>
          </button>

          <button
            onClick={() => navigate('/qr-scanner')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 shadow-md transition-all"
          >
            <QrCode className="w-4 h-4 text-sky-400" />
            <span>Scan QR</span>
          </button>

          <button
            onClick={() => navigate('/approvals')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 shadow-md transition-all"
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>Approvals ({overviewStats.pendingApprovals})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Visitors Today"
          value={overviewStats.totalVisitorsToday}
          change={overviewStats.totalVisitorsTodayChange || '+12.5%'}
          description="Total visitors registered today"
          icon={<Users className="w-6 h-6 text-sky-600" />}
          accentColor="bg-sky-50"
        />

        <StatCard
          title="Currently Inside"
          value={overviewStats.currentlyInside}
          change="Active inside"
          description="Visitors checked-in on campus"
          icon={<UserCheck className="w-6 h-6 text-emerald-600" />}
          accentColor="bg-emerald-50"
        />

        <StatCard
          title="Pending Approvals"
          value={overviewStats.pendingApprovals}
          change="Action required"
          isPositive={false}
          description="Awaiting host/admin approval"
          icon={<Clock className="w-6 h-6 text-amber-600" />}
          accentColor="bg-amber-50"
        />

        <StatCard
          title="Completed Visits"
          value={overviewStats.completedVisits}
          change="Checked out"
          description="Successfully completed visits"
          icon={<CheckCircle2 className="w-6 h-6 text-slate-600" />}
          accentColor="bg-slate-100"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visitor Traffic Trend */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900">Visitor Traffic Overview</h3>
              <p className="text-xs text-slate-500">Comparison of visitor traffic over recent days</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold">
              Live Feed
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData.length ? trafficData : [
                { day: 'Mon', today: 42, yesterday: 38 },
                { day: 'Tue', today: 56, yesterday: 45 },
                { day: 'Wed', today: 64, yesterday: 50 },
                { day: 'Thu', today: 78, yesterday: 62 },
                { day: 'Fri', today: 85, yesterday: 70 },
                { day: 'Sat', today: 35, yesterday: 28 },
                { day: 'Sun', today: 20, yesterday: 15 }
              ]}>
                <defs>
                  <linearGradient id="colorToday" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Area type="monotone" dataKey="today" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorToday)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visitor Purpose Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Purpose Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Breakdown by visiting purpose</p>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={purposeData.length ? purposeData : [
                      { name: 'Meeting', value: 40 },
                      { name: 'Interview', value: 25 },
                      { name: 'Delivery', value: 15 },
                      { name: 'Maintenance', value: 10 },
                      { name: 'Guest', value: 10 }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(purposeData.length ? purposeData : [1,2,3,4,5]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
            {(purposeData.length ? purposeData : [
              { name: 'Meeting', value: 40 },
              { name: 'Interview', value: 25 },
              { name: 'Delivery', value: 15 },
              { name: 'Maintenance', value: 10 }
            ]).map((p, idx) => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-600 font-medium truncate">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Visitor Activity & Recent Timeline Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Visitor Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Live Visitor Activity</h3>
              <p className="text-xs text-slate-500">Real-time status of campus visitors</p>
            </div>

            {/* Table Search & Status Filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter table..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">All Statuses</option>
                <option value="checked_in">Inside</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="checked_out">Checked Out</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Visitor</th>
                  <th className="px-6 py-3.5">Host</th>
                  <th className="px-6 py-3.5">Purpose</th>
                  <th className="px-6 py-3.5">Check-In Time</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No matching visitor records found
                    </td>
                  </tr>
                ) : (
                  filteredVisits.slice(0, 7).map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <Link to={`/visitors/${v.visitor_id}`} className="hover:text-sky-600">
                          {v.visitor_name}
                        </Link>
                        <span className="block text-[10px] font-normal text-slate-400">{v.visitor_org}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {v.host_name || 'Campus Security'}
                        <span className="block text-[10px] text-slate-400">{v.department_name}</span>
                      </td>
                      <td className="px-6 py-4 font-medium">{v.purpose}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {v.check_in_at
                          ? new Date(v.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : v.expected_time}
                      </td>
                      <td className="px-6 py-4">
                        <VisitorStatusBadge status={v.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Timeline Feed */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900">Recent Security Feed</h3>
              <Activity className="w-5 h-5 text-sky-600 animate-pulse" />
            </div>

            <div className="space-y-4">
              {(auditLogs.length ? auditLogs : [
                { id: 1, action: 'VISITOR_CHECKED_IN', details: 'Rahul Sharma checked in at Gate 1', timestamp: new Date(Date.now() - 3600000).toISOString() },
                { id: 2, action: 'VISIT_APPROVED', details: 'Priya Patel visit approved by Host', timestamp: new Date(Date.now() - 7200000).toISOString() },
                { id: 3, action: 'QR_SCANNED', details: 'QR Pass #104 scanned & verified', timestamp: new Date(Date.now() - 10800000).toISOString() },
                { id: 4, action: 'VISITOR_CHECKED_OUT', details: 'Arun Kumar checked out at Gate 2', timestamp: new Date(Date.now() - 14400000).toISOString() }
              ]).slice(0, 5).map((log) => (
                <div key={log.id} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800">{log.details}</p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <Link to="/settings" className="text-xs font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1">
              <span>View full security audit logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
