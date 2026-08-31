import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Visit } from '../types';
import { useNotifications } from '../context/NotificationContext';
import { CheckSquare, CheckCircle2, XCircle, Clock, User, Building2, Calendar } from 'lucide-react';

export const ApprovalsPage: React.FC = () => {
  const [pendingVisits, setPendingVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingVisitId, setRejectingVisitId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const { showToast } = useNotifications();

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.get('/approvals/pending');
      if (res.data.success) {
        setPendingVisits(res.data.data);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      const res = await api.post(`/approvals/${id}/approve`, { reason: 'Approved by host/admin' });
      if (res.data.success) {
        showToast('Visit request approved! QR pass generated.', 'success');
        fetchPending();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to approve request', 'error');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingVisitId) return;
    try {
      const res = await api.post(`/approvals/${rejectingVisitId}/reject`, { reason: rejectReason });
      if (res.data.success) {
        showToast('Visit request rejected.', 'info');
        setRejectingVisitId(null);
        setRejectReason('');
        fetchPending();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to reject request', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Visitor Approval Queue</h2>
          <p className="text-xs text-slate-500">Review and authorize pending campus visitor entries</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-200">
          <Clock className="w-4 h-4" />
          <span>{pendingVisits.length} Pending Approval</span>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading pending approval requests...</div>
      ) : pendingVisits.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">All Clear! No Pending Requests</h3>
          <p className="text-xs text-slate-400 mt-1">New visitor registration requests will appear here for review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pendingVisits.map((visit) => (
            <div key={visit.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">{visit.visitor_name}</h4>
                    <p className="text-xs text-slate-500">{visit.visitor_org || 'Individual Visitor'}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px]">
                    Pending
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Host: <strong className="text-slate-900">{visit.host_name || 'General Campus'}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Purpose: <strong>{visit.purpose}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Date: <strong>{visit.expected_date}</strong> at {visit.expected_time}</span>
                  </div>
                </div>

                {visit.notes && (
                  <p className="text-xs bg-slate-50 p-2.5 rounded-xl text-slate-600 border border-slate-100">
                    "{visit.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleApprove(visit.id)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve</span>
                </button>

                <button
                  onClick={() => setRejectingVisitId(visit.id)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingVisitId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Reject Visitor Request</h3>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Reason for Rejection
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Host unavailable at specified time"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRejectingVisitId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-md"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
