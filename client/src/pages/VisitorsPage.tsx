import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Visit } from '../types';
import { VisitorStatusBadge } from '../components/VisitorStatusBadge';
import { Link } from 'react-router-dom';
import { Search, Download, Filter, Eye, UserPlus, Calendar, RefreshCw } from 'lucide-react';

export const VisitorsPage: React.FC = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('all');

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const res = await api.get('/visits');
      if (res.data.success) {
        setVisits(res.data.data);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const filteredVisits = visits.filter((v) => {
    const matchesSearch =
      v.visitor_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.visitor_email?.toLowerCase().includes(search.toLowerCase()) ||
      v.host_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.purpose?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchesPurpose = purposeFilter === 'all' || v.purpose === purposeFilter;

    return matchesSearch && matchesStatus && matchesPurpose;
  });

  const exportCSV = () => {
    const headers = ['ID,Visitor Name,Email,Phone,Organization,Host,Purpose,Expected Date,Status\n'];
    const rows = filteredVisits.map(
      (v) => `${v.id},"${v.visitor_name}","${v.visitor_email}","${v.visitor_phone}","${v.visitor_org}","${v.host_name}","${v.purpose}","${v.expected_date}","${v.status}"\n`
    );

    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitor_records_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Visitor Directory & History</h2>
          <p className="text-xs text-slate-500">Manage and track all registered visitor entries</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <Link
            to="/visitors/register"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Visitor</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search visitor, email, host, org..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="all">All Statuses</option>
          <option value="checked_in">🟢 Inside (Checked In)</option>
          <option value="approved">🔵 Approved</option>
          <option value="pending">🟡 Pending Approval</option>
          <option value="checked_out">⚪ Checked Out</option>
          <option value="rejected">🔴 Rejected</option>
        </select>

        <select
          value={purposeFilter}
          onChange={(e) => setPurposeFilter(e.target.value)}
          className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="all">All Visit Purposes</option>
          <option value="Meeting">Meeting</option>
          <option value="Interview">Interview</option>
          <option value="Delivery">Delivery</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Guest Lecture">Guest Lecture</option>
        </select>
      </div>

      {/* Visitors Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Visitor</th>
                <th className="px-6 py-4">Organization</th>
                <th className="px-6 py-4">Host</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4">Expected Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <span>Loading visitor directory...</span>
                  </td>
                </tr>
              ) : filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No visitor records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <Link to={`/visitors/${visit.visitor_id}`} className="hover:text-sky-600">
                        {visit.visitor_name}
                      </Link>
                      <span className="block text-[10px] font-normal text-slate-400">{visit.visitor_phone}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{visit.visitor_org || 'Independent'}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {visit.host_name || 'Campus Gate'}
                      <span className="block text-[10px] text-slate-400">{visit.department_name}</span>
                    </td>
                    <td className="px-6 py-4 font-medium">{visit.purpose}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {visit.expected_date} ({visit.expected_time})
                    </td>
                    <td className="px-6 py-4">
                      <VisitorStatusBadge status={visit.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/visitors/${visit.visitor_id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
