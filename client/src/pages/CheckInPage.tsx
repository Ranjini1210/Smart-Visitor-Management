import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Visit } from '../types';
import { VisitorStatusBadge } from '../components/VisitorStatusBadge';
import { useNotifications } from '../context/NotificationContext';
import { LogIn, LogOut, CheckCircle2, Clock, UserCheck, Shield } from 'lucide-react';

export const CheckInPage: React.FC = () => {
  const [activeVisits, setActiveVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotifications();

  const fetchActiveVisits = async () => {
    setLoading(true);
    try {
      const res = await api.get('/visits');
      if (res.data.success) {
        setActiveVisits(res.data.data);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchActiveVisits();
  }, []);

  const handleCheckIn = async (id: number) => {
    try {
      const res = await api.post(`/visits/${id}/check-in`);
      if (res.data.success) {
        showToast('Visitor checked in successfully!', 'success');
        fetchActiveVisits();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Check-in failed', 'error');
    }
  };

  const handleCheckOut = async (id: number) => {
    try {
      const res = await api.post(`/visits/${id}/check-out`);
      if (res.data.success) {
        showToast('Visitor checked out successfully!', 'success');
        fetchActiveVisits();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Check-out failed', 'error');
    }
  };

  const currentlyInside = activeVisits.filter((v) => v.status === 'checked_in');
  const approvedUpcoming = activeVisits.filter((v) => v.status === 'approved');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Check-In & Check-Out Control</h2>
          <p className="text-xs text-slate-500">Monitor live campus presence and manage gate entries</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
            <UserCheck className="w-4 h-4" />
            <span>{currentlyInside.length} Currently Inside</span>
          </div>
        </div>
      </div>

      {/* Currently Inside Campus Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Currently Inside Campus ({currentlyInside.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Visitor</th>
                <th className="px-6 py-4">Host</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4">Check-In Timestamp</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentlyInside.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No visitors are currently checked-in inside campus.
                  </td>
                </tr>
              ) : (
                currentlyInside.map((visit) => (
                  <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {visit.visitor_name}
                      <span className="block text-[10px] font-normal text-slate-400">{visit.visitor_org}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{visit.host_name || 'Campus Gate'}</td>
                    <td className="px-6 py-4 font-medium">{visit.purpose}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono">
                      {visit.check_in_at
                        ? new Date(visit.check_in_at).toLocaleTimeString()
                        : 'Just now'}
                    </td>
                    <td className="px-6 py-4">
                      <VisitorStatusBadge status={visit.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleCheckOut(visit.id)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors"
                      >
                        Check Out
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approved Upcoming Visitors Ready for Gate Check-In */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-extrabold text-base text-slate-900">
            Approved Visitors Awaiting Arrival ({approvedUpcoming.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Visitor</th>
                <th className="px-6 py-4">Host</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4">Expected Arrival</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Gate Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {approvedUpcoming.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No approved visitors awaiting gate arrival.
                  </td>
                </tr>
              ) : (
                approvedUpcoming.map((visit) => (
                  <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{visit.visitor_name}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{visit.host_name || 'Campus Gate'}</td>
                    <td className="px-6 py-4 font-medium">{visit.purpose}</td>
                    <td className="px-6 py-4 text-slate-600">{visit.expected_time}</td>
                    <td className="px-6 py-4">
                      <VisitorStatusBadge status={visit.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleCheckIn(visit.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
                      >
                        ✓ Gate Check-In
                      </button>
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
