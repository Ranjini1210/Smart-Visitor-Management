import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { User, Visit } from '../types';
import { UserPlus, QrCode, CheckCircle2, ShieldCheck, Download, ArrowRight } from 'lucide-react';
import { VisitorStatusBadge } from '../components/VisitorStatusBadge';

export const RegisterVisitorPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [hosts, setHosts] = useState<User[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [createdVisit, setCreatedVisit] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [idType, setIdType] = useState('Aadhaar Card');
  const [idNumber, setIdNumber] = useState('');
  const [hostId, setHostId] = useState('');
  const [purpose, setPurpose] = useState('Meeting');
  const [expectedDate, setExpectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedTime, setExpectedTime] = useState('10:30 AM');
  const [duration, setDuration] = useState('1 Hour');
  const [accompanyingCount, setAccompanyingCount] = useState(0);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadMetadata() {
      try {
        const [hostsRes, deptsRes] = await Promise.all([
          api.get('/settings/hosts').catch(() => null),
          api.get('/settings/departments').catch(() => null)
        ]);
        if (hostsRes?.data?.success) setHosts(hostsRes.data.data);
        if (deptsRes?.data?.success) setDepartments(deptsRes.data.data);
      } catch {}
    }
    loadMetadata();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/visits', {
        name,
        phone,
        email,
        organization,
        id_type: idType,
        id_number: idNumber,
        host_id: hostId || null,
        purpose,
        expected_date: expectedDate,
        expected_time: expectedTime,
        duration,
        accompanying_count: accompanyingCount,
        vehicle_number: vehicleNumber,
        notes
      });

      if (res.data.success) {
        setCreatedVisit(res.data.data);
        showToast('Visitor registered successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to register visitor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCreatedVisit(null);
    setName('');
    setPhone('');
    setEmail('');
    setOrganization('');
    setIdNumber('');
    setVehicleNumber('');
    setNotes('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Digital Visitor Registration</h2>
          <p className="text-xs text-slate-500">Register expected or walk-in campus visitors</p>
        </div>
        <div className="p-3 rounded-2xl bg-sky-50 text-sky-600">
          <UserPlus className="w-6 h-6" />
        </div>
      </div>

      {!createdVisit ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Section 1: Visitor Information */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 text-sky-600 flex items-center gap-2">
                <span>1. Visitor Personal Details</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="vikram@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Organization / Company
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Infosys Ltd"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Identity Proof Type
                  </label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Passport">Passport</option>
                    <option value="Voter ID">Voter ID</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    ID Document Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5489 1234 9876"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Visit Information */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 text-sky-600">
                2. Visit Parameters & Host Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Host / Employee
                  </label>
                  <select
                    value={hostId}
                    onChange={(e) => setHostId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="">Select Host Staff Member</option>
                    {hosts.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.department_name || 'General Staff'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Purpose of Visit *
                  </label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Meeting">Official Meeting</option>
                    <option value="Interview">Recruitment / Interview</option>
                    <option value="Delivery">Delivery / Courier</option>
                    <option value="Maintenance">Vendor / Maintenance</option>
                    <option value="Guest Lecture">Guest Lecture / Academic</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Expected Visit Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Expected Arrival Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="10:30 AM"
                    value={expectedTime}
                    onChange={(e) => setExpectedTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Expected Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="30 Mins">30 Minutes</option>
                    <option value="1 Hour">1 Hour</option>
                    <option value="2 Hours">2 Hours</option>
                    <option value="Half Day">Half Day (4 Hours)</option>
                    <option value="Full Day">Full Day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Accompanying Visitors Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={accompanyingCount}
                    onChange={(e) => setAccompanyingCount(parseInt(e.target.value || '0', 10))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Additional Notes */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 text-sky-600">
                3. Vehicle & Notes (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Vehicle Registration Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KA-01-AB-1234"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Additional Notes / Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bringing presentation laptop"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm shadow-xl shadow-sky-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{loading ? 'Processing Registration...' : 'Submit & Generate Digital QR Pass'}</span>
            </button>
          </div>
        </form>
      ) : (
        /* Confirmation Screen & QR Code Receipt */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-8 max-w-lg mx-auto text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Registration Successful!</h3>
            <p className="text-xs text-slate-500 mt-1">Unique QR Entry Pass Generated for Visitor</p>
          </div>

          {/* QR Pass Box */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-inner space-y-4">
            <div className="w-48 h-48 bg-white p-3 rounded-2xl mx-auto shadow-md">
              <img src={createdVisit.qr_image} alt="Visitor QR Code" className="w-full h-full object-contain" />
            </div>

            <div>
              <p className="font-mono text-sm tracking-widest text-sky-400 font-bold">{createdVisit.qr_token}</p>
              <h4 className="text-base font-bold text-white mt-1">{createdVisit.visitor_name}</h4>
              <p className="text-xs text-slate-400">{createdVisit.purpose} • {createdVisit.expected_date}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors"
            >
              Print QR Receipt
            </button>
            <button
              onClick={resetForm}
              className="flex-1 py-3 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-500 transition-colors"
            >
              Register Another Visitor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
