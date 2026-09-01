import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Visit } from '../types';
import { VisitorStatusBadge } from '../components/VisitorStatusBadge';
import { useNotifications } from '../context/NotificationContext';
import {
  LogIn,
  LogOut,
  CheckCircle2,
  Clock,
  UserCheck,
  Shield,
  Search,
  Mail,
  Phone,
  QrCode,
  UserPlus,
  ArrowRight,
  RefreshCw,
  Printer,
  Sparkles,
  AlertCircle,
  Building2
} from 'lucide-react';

export const CheckInPage: React.FC = () => {
  const [activeVisits, setActiveVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<Visit | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'inside' | 'approved' | 'all' | 'walkin'>('inside');
  const [lastProcessedVisit, setLastProcessedVisit] = useState<Visit | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Walk-in Quick Form State
  const [walkinName, setWalkinName] = useState('');
  const [walkinEmail, setWalkinEmail] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinPurpose, setWalkinPurpose] = useState('Official Meeting');
  const [walkinHost, setWalkinHost] = useState('Dr. Rajesh Sharma');

  const { showToast } = useNotifications();

  const demoEmails = [
    { label: 'Rahul Sharma', email: 'visitor@campus.edu', status: 'Inside' },
    { label: 'Priya Patel', email: 'priya.patel@innovate.org', status: 'Approved' },
    { label: 'Sunita Rao', email: 'sunita.rao@eduforum.in', status: 'Approved' },
    { label: 'Arun Kumar', email: 'arun.k@logistics.com', status: 'Approved' },
    { label: 'Rohan Mehta', email: 'rohan.mehta@vendor.co', status: 'Checked Out' }
  ];

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

  // Handle Instant Search / Lookup
  const handleSearchLookup = async (queryText: string) => {
    const q = queryText.trim();
    setSearchQuery(q);
    setLookupError(null);
    if (!q) {
      setLookupResult(null);
      return;
    }

    try {
      const res = await api.get(`/check-in/lookup?q=${encodeURIComponent(q)}`);
      if (res.data.success && res.data.data.length > 0) {
        setLookupResult(res.data.data[0]);
        setLookupError(null);
      } else {
        setLookupResult(null);
        setLookupError(`No pre-scheduled pass found for "${q}". You can check in as an instant walk-in.`);
      }
    } catch {
      setLookupResult(null);
      setLookupError(`No records found for "${q}".`);
    }
  };

  // Instant Check-In by Email or Pass Token
  const handleInstantCheckIn = async (emailOrQuery: string) => {
    if (!emailOrQuery.trim()) {
      showToast('Please enter an email address or pass token', 'warning');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.post('/check-in/instant-check-in', { query: emailOrQuery.trim() });
      if (res.data.success) {
        showToast(res.data.message || 'Visitor checked in successfully!', 'success');
        setLastProcessedVisit(res.data.data);
        setShowReceiptModal(true);
        setSearchQuery('');
        setLookupResult(null);
        setLookupError(null);
        fetchActiveVisits();
      } else {
        showToast(res.data.message || 'Check-in failed', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Check-in failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Instant Check-Out by Email or Pass Token
  const handleInstantCheckOut = async (emailOrQuery: string) => {
    if (!emailOrQuery.trim()) {
      showToast('Please enter an email address or pass token', 'warning');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.post('/check-in/instant-check-out', { query: emailOrQuery.trim() });
      if (res.data.success) {
        showToast(res.data.message || 'Visitor checked out successfully!', 'success');
        setLastProcessedVisit(res.data.data);
        setShowReceiptModal(true);
        setSearchQuery('');
        setLookupResult(null);
        setLookupError(null);
        fetchActiveVisits();
      } else {
        showToast(res.data.message || 'Check-out failed', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Check-out failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Direct ID Check In
  const handleCheckIn = async (id: number) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/visits/${id}/check-in`);
      if (res.data.success) {
        showToast('Visitor checked in successfully!', 'success');
        setLastProcessedVisit(res.data.data);
        setShowReceiptModal(true);
        fetchActiveVisits();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Check-in failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Direct ID Check Out
  const handleCheckOut = async (id: number) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/visits/${id}/check-out`);
      if (res.data.success) {
        showToast('Visitor checked out successfully!', 'success');
        setLastProcessedVisit(res.data.data);
        setShowReceiptModal(true);
        fetchActiveVisits();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Check-out failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Walk-in Registration & Check In
  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName || !walkinEmail) {
      showToast('Please enter visitor name and email', 'warning');
      return;
    }
    setActionLoading(true);
    try {
      // 1. Create visit
      const res = await api.post('/visits', {
        name: walkinName,
        email: walkinEmail,
        phone: walkinPhone || '+91 98765 43210',
        organization: 'Walk-in Visitor',
        id_type: 'Govt Photo ID',
        id_number: 'WI-' + Math.floor(100000 + Math.random() * 900000),
        purpose: walkinPurpose,
        expected_date: new Date().toISOString().split('T')[0],
        expected_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: '2 Hours'
      });

      if (res.data.success) {
        const createdVisitId = res.data.data.id;
        // 2. Immediately Check In
        const checkInRes = await api.post(`/visits/${createdVisitId}/check-in`);
        showToast(`✓ Walk-in visitor ${walkinName} registered and checked in!`, 'success');
        setLastProcessedVisit(checkInRes.data.data || res.data.data);
        setShowReceiptModal(true);
        setWalkinName('');
        setWalkinEmail('');
        setWalkinPhone('');
        fetchActiveVisits();
        setSelectedTab('inside');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to process walk-in', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const currentlyInside = activeVisits.filter((v) => v.status === 'checked_in');
  const approvedUpcoming = activeVisits.filter((v) => v.status === 'approved' || v.status === 'pending');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950 p-6 md:p-8 rounded-3xl text-white shadow-xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Access Control Terminal
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
            Gate Check-In & Check-Out Hub
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1">
            Seamlessly check in or check out visitors by Email ID, Phone Number, or QR Pass.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{currentlyInside.length} Active on Campus</span>
          </div>
          <button
            onClick={fetchActiveVisits}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Universal Instant Lookup & Action Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-sky-600" />
              <span>Universal Visitor Check-In & Check-Out by Email / Pass ID</span>
            </h3>
            <p className="text-xs text-slate-500">
              Type any visitor email (e.g. <code>visitor@campus.edu</code>), phone number, or pass code.
            </p>
          </div>
        </div>

        {/* Input Bar with Instant Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Enter Visitor Email (e.g. visitor@campus.edu), Phone, or Pass ID"
              value={searchQuery}
              onChange={(e) => handleSearchLookup(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleInstantCheckIn(searchQuery);
              }}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleInstantCheckIn(searchQuery)}
              disabled={actionLoading || !searchQuery.trim()}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all shrink-0"
            >
              <LogIn className="w-4 h-4" />
              <span>{actionLoading ? 'Processing...' : '✓ Check In'}</span>
            </button>

            <button
              onClick={() => handleInstantCheckOut(searchQuery)}
              disabled={actionLoading || !searchQuery.trim()}
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all shrink-0"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>⎋ Check Out</span>
            </button>
          </div>
        </div>

        {/* Quick Demo Test Email Chips */}
        <div className="pt-2">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
            One-Click Test Visitor Emails:
          </p>
          <div className="flex flex-wrap gap-2">
            {demoEmails.map((item) => (
              <button
                key={item.email}
                type="button"
                onClick={() => {
                  setSearchQuery(item.email);
                  handleSearchLookup(item.email);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 border border-slate-200 text-xs font-semibold text-slate-700 transition-all flex items-center gap-1.5"
              >
                <span>{item.label}</span>
                <span className="text-[10px] text-slate-400 font-mono">({item.email})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Lookup Result Card */}
        {lookupResult && (
          <div className="p-5 rounded-2xl bg-sky-50/80 border border-sky-200 animate-in fade-in zoom-in-95 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">{lookupResult.visitor_name}</span>
                <VisitorStatusBadge status={lookupResult.status} />
              </div>
              <p className="text-xs text-slate-600">
                <strong>Email:</strong> {lookupResult.visitor_email} • <strong>Phone:</strong> {lookupResult.visitor_phone}
              </p>
              <p className="text-xs text-slate-600">
                <strong>Host:</strong> {lookupResult.host_name || 'Campus Security'} • <strong>Purpose:</strong> {lookupResult.purpose}
              </p>
              <p className="text-[11px] font-mono text-sky-700 font-bold">
                Pass Token: {lookupResult.qr_token}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {lookupResult.status !== 'checked_in' ? (
                <button
                  onClick={() => handleCheckIn(lookupResult.id)}
                  disabled={actionLoading}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  ✓ Check In Visitor
                </button>
              ) : (
                <button
                  onClick={() => handleCheckOut(lookupResult.id)}
                  disabled={actionLoading}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors"
                >
                  ⎋ Check Out Visitor
                </button>
              )}
            </div>
          </div>
        )}

        {lookupError && !lookupResult && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{lookupError}</span>
            </div>
            <button
              onClick={() => handleInstantCheckIn(searchQuery)}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0"
            >
              Check In as Walk-in Now
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSelectedTab('inside')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
            selectedTab === 'inside'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Currently Inside ({currentlyInside.length})</span>
        </button>

        <button
          onClick={() => setSelectedTab('approved')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
            selectedTab === 'approved'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>Awaiting Arrival ({approvedUpcoming.length})</span>
        </button>

        <button
          onClick={() => setSelectedTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
            selectedTab === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>All Visits History ({activeVisits.length})</span>
        </button>

        <button
          onClick={() => setSelectedTab('walkin')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
            selectedTab === 'walkin'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>+ Fast Walk-In Entry Desk</span>
        </button>
      </div>

      {/* Tab 1: Currently Inside Campus */}
      {selectedTab === 'inside' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Campus Visitors ({currentlyInside.length})</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Click Check Out when visitor departs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Visitor & Contact</th>
                  <th className="px-6 py-4">Host / Department</th>
                  <th className="px-6 py-4">Purpose</th>
                  <th className="px-6 py-4">Check-In Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Departure Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentlyInside.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No visitors are currently checked-in inside campus.
                    </td>
                  </tr>
                ) : (
                  currentlyInside.map((visit) => (
                    <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {visit.visitor_name}
                        <span className="block text-[11px] font-normal text-slate-500">{visit.visitor_email}</span>
                        <span className="block text-[10px] text-slate-400">{visit.visitor_phone}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {visit.host_name || 'Campus Gate'}
                        <span className="block text-[10px] text-slate-400">{visit.department_name || 'General Access'}</span>
                      </td>
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
                          disabled={actionLoading}
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
      )}

      {/* Tab 2: Approved Visitors Awaiting Gate Arrival */}
      {selectedTab === 'approved' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">
              Visitors Scheduled for Arrival ({approvedUpcoming.length})
            </h3>
            <span className="text-xs text-slate-500 font-medium">Click Gate Check-In upon physical arrival</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Visitor & Contact</th>
                  <th className="px-6 py-4">Host</th>
                  <th className="px-6 py-4">Purpose</th>
                  <th className="px-6 py-4">Expected Date & Time</th>
                  <th className="px-6 py-4">Pass ID</th>
                  <th className="px-6 py-4 text-right">Gate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approvedUpcoming.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No visitors currently awaiting arrival.
                    </td>
                  </tr>
                ) : (
                  approvedUpcoming.map((visit) => (
                    <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {visit.visitor_name}
                        <span className="block text-[11px] font-normal text-slate-500">{visit.visitor_email}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">{visit.host_name || 'Campus Gate'}</td>
                      <td className="px-6 py-4 font-medium">{visit.purpose}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {visit.expected_date} • {visit.expected_time}
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] font-bold text-sky-700">
                        {visit.qr_token}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleCheckIn(visit.id)}
                          disabled={actionLoading}
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
      )}

      {/* Tab 3: All Visits History */}
      {selectedTab === 'all' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-slate-900">
              All Visits & Gate Passes Directory
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Visitor</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Host</th>
                  <th className="px-6 py-4">Purpose</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{visit.visitor_name}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-[11px]">{visit.visitor_email}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{visit.host_name || 'Campus Gate'}</td>
                    <td className="px-6 py-4 font-medium">{visit.purpose}</td>
                    <td className="px-6 py-4">
                      <VisitorStatusBadge status={visit.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {visit.status === 'checked_in' ? (
                        <button
                          onClick={() => handleCheckOut(visit.id)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                        >
                          Check Out
                        </button>
                      ) : visit.status === 'approved' || visit.status === 'pending' ? (
                        <button
                          onClick={() => handleCheckIn(visit.id)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                        >
                          Check In
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Rapid Walk-In Form */}
      {selectedTab === 'walkin' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-8 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-2">
              <UserPlus className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Fast Walk-In Entry Desk</h3>
            <p className="text-xs text-slate-500">
              Register visitor and immediately grant active check-in pass.
            </p>
          </div>

          <form onSubmit={handleWalkInSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Visitor Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh.k@company.com"
                  value={walkinEmail}
                  onChange={(e) => setWalkinEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Purpose of Visit
                </label>
                <select
                  value={walkinPurpose}
                  onChange={(e) => setWalkinPurpose(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="Official Meeting">Official Meeting</option>
                  <option value="Interview">Recruitment / Interview</option>
                  <option value="Delivery">Delivery / Courier</option>
                  <option value="Vendor / Maintenance">Vendor / Maintenance</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm shadow-xl shadow-sky-600/30 flex items-center justify-center gap-2 transition-all mt-4"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{actionLoading ? 'Issuing Pass...' : 'Issue Badge & Instant Check In'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Confirmation & Printable Badge Modal */}
      {showReceiptModal && lastProcessedVisit && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {lastProcessedVisit.status === 'checked_in' ? 'Check-In Successful!' : 'Check-Out Completed!'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Digital Gate Access Badge Issued</p>
            </div>

            <div className="p-5 bg-slate-900 text-white rounded-2xl text-left space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Campus Entry Pass</span>
                <span className="text-[11px] font-mono font-bold text-sky-400">{lastProcessedVisit.qr_token}</span>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-white">{lastProcessedVisit.visitor_name}</h4>
                <p className="text-xs text-slate-300">{lastProcessedVisit.visitor_email}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800 text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-400 block">Host / Dept:</span>
                  <span className="font-semibold text-white">{lastProcessedVisit.host_name || 'Campus Gate'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Timestamp:</span>
                  <span className="font-semibold text-white">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Badge</span>
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

