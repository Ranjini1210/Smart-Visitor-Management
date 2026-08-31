import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Visitor, Visit } from '../types';
import { VisitorStatusBadge } from '../components/VisitorStatusBadge';
import { User, Phone, Mail, Building2, CreditCard, Calendar, Clock, CheckCircle2, ArrowLeft } from 'lucide-react';

export const VisitorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVisitor() {
      try {
        const res = await api.get(`/visitors/${id}`);
        if (res.data.success) {
          setVisitor(res.data.data);
        }
      } catch {}
      setLoading(false);
    }
    fetchVisitor();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading visitor profile...
      </div>
    );
  }

  if (!visitor) {
    return (
      <div className="p-12 text-center">
        <h3 className="text-lg font-bold text-slate-800">Visitor Profile Not Found</h3>
        <Link to="/visitors" className="text-xs font-semibold text-sky-600 hover:text-sky-700 mt-2 inline-block">
          ← Back to visitor directory
        </Link>
      </div>
    );
  }

  const visits = visitor.visits || [];
  const latestVisit = visits[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Navigation */}
      <div>
        <Link to="/visitors" className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Visitor Directory</span>
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {visitor.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">{visitor.name}</h2>
            <p className="text-xs text-slate-500 font-medium">{visitor.organization || 'Independent Visitor'}</p>
          </div>
        </div>

        {latestVisit && <VisitorStatusBadge status={latestVisit.status} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal & Identification Info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Personal Details
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="font-semibold text-slate-800">{visitor.phone}</span>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="font-semibold text-slate-800">{visitor.email}</span>
            </div>

            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="font-semibold text-slate-800">{visitor.organization}</span>
            </div>

            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-sky-600 shrink-0" />
              <div>
                <span className="font-semibold text-slate-800">{visitor.id_type}</span>
                <span className="block text-[10px] text-slate-400">{visitor.id_number}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Visit Details & Timeline */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Visit Lifecycle Step Timeline
          </h3>

          {latestVisit ? (
            <div className="space-y-6">
              {/* Timeline Steps */}
              <div className="relative pl-6 border-l-2 border-sky-100 space-y-6">
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-sky-600 ring-4 ring-white" />
                  <h4 className="font-bold text-xs text-slate-900">Registration Received</h4>
                  <p className="text-xs text-slate-500">Visit requested for {latestVisit.purpose} with {latestVisit.host_name}</p>
                </div>

                <div className="relative">
                  <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full ring-4 ring-white ${
                    ['approved', 'checked_in', 'checked_out'].includes(latestVisit.status) ? 'bg-sky-600' : 'bg-slate-300'
                  }`} />
                  <h4 className="font-bold text-xs text-slate-900">Host Approval & QR Generated</h4>
                  <p className="text-xs text-slate-500">QR pass pass token issued: {latestVisit.qr_token}</p>
                </div>

                <div className="relative">
                  <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full ring-4 ring-white ${
                    ['checked_in', 'checked_out'].includes(latestVisit.status) ? 'bg-emerald-600' : 'bg-slate-300'
                  }`} />
                  <h4 className="font-bold text-xs text-slate-900">Campus Check-In</h4>
                  <p className="text-xs text-slate-500">
                    {latestVisit.check_in_at
                      ? `Checked in at ${new Date(latestVisit.check_in_at).toLocaleTimeString()}`
                      : 'Awaiting arrival at security desk'}
                  </p>
                </div>

                <div className="relative">
                  <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full ring-4 ring-white ${
                    latestVisit.status === 'checked_out' ? 'bg-slate-800' : 'bg-slate-300'
                  }`} />
                  <h4 className="font-bold text-xs text-slate-900">Campus Check-Out</h4>
                  <p className="text-xs text-slate-500">
                    {latestVisit.check_out_at
                      ? `Completed visit and checked out at ${new Date(latestVisit.check_out_at).toLocaleTimeString()}`
                      : 'Visit in progress or upcoming'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No visit history recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
