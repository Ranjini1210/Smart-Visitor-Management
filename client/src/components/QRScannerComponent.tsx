import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, Camera, Keyboard, CheckCircle2, XCircle, RefreshCw, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import { Visit } from '../types';
import { VisitorStatusBadge } from './VisitorStatusBadge';
import { useNotifications } from '../context/NotificationContext';

interface Props {
  onVerified?: (visit: Visit) => void;
}

export const QRScannerComponent: React.FC<Props> = ({ onVerified }) => {
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [scannedVisit, setScannedVisit] = useState<Visit | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const { showToast } = useNotifications();

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (activeTab === 'camera' && !scannedVisit) {
      scanner = new Html5QrcodeScanner(
        'reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true
        },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          verifyToken(decodedText);
          if (scanner) {
            scanner.clear().catch(() => {});
          }
        },
        (error) => {
          // silent camera scan error polling
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [activeTab, scannedVisit]);

  const verifyToken = async (tokenStr: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.post('/qr/verify', { token: tokenStr });
      if (res.data.success) {
        setScannedVisit(res.data.data);
        showToast('QR Pass verified successfully!', 'success');
        if (onVerified) onVerified(res.data.data);
      } else {
        setErrorMsg(res.data.message || 'Invalid QR Token');
        showToast(res.data.message || 'Invalid QR Token', 'error');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to verify QR code token';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualToken.trim()) {
      verifyToken(manualToken.trim());
    }
  };

  const handleCheckIn = async () => {
    if (!scannedVisit) return;
    setLoading(true);
    try {
      const res = await api.post(`/visits/${scannedVisit.id}/check-in`);
      if (res.data.success) {
        setScannedVisit(res.data.data);
        showToast(`Visitor ${scannedVisit.visitor_name} checked in successfully!`, 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Check-in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!scannedVisit) return;
    setLoading(true);
    try {
      const res = await api.post(`/visits/${scannedVisit.id}/check-out`);
      if (res.data.success) {
        setScannedVisit(res.data.data);
        showToast(`Visitor ${scannedVisit.visitor_name} checked out successfully!`, 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Check-out failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScannedVisit(null);
    setErrorMsg(null);
    setManualToken('');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header Bar */}
      <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-600 text-white">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base">QR Security Verification Engine</h3>
            <p className="text-xs text-slate-400">Instant Access Control Scanner</p>
          </div>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveTab('camera');
              resetScanner();
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'camera' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Camera</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('manual');
              resetScanner();
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'manual' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Manual Input</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {!scannedVisit ? (
          <div>
            {activeTab === 'camera' ? (
              <div className="flex flex-col items-center justify-center min-h-[320px]">
                <div id="reader" className="w-full max-w-md overflow-hidden rounded-2xl border-2 border-sky-200" />
                <p className="mt-4 text-xs text-slate-500 text-center">
                  Position visitor QR pass in front of camera to automatically scan & verify.
                </p>
              </div>
            ) : (
              <div className="max-w-md mx-auto py-8">
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Enter QR Token / Visit Pass ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SVM-1-ABCD1234"
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold tracking-wide uppercase focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !manualToken.trim()}
                    className="w-full py-3 rounded-xl bg-sky-600 text-white font-bold text-sm shadow-md hover:bg-sky-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    <span>Verify QR Pass</span>
                  </button>
                </form>
              </div>
            )}

            {/* Evaluator Demo Quick Buttons */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
                Demo Quick Scan Shortcuts (Click to simulate scan)
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => verifyToken('SVM-1-DEMO')}
                  className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold hover:bg-sky-100 border border-sky-200"
                >
                  Pass #1 (Rahul Sharma - Checked In)
                </button>
                <button
                  onClick={() => verifyToken('SVM-2-DEMO')}
                  className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold hover:bg-sky-100 border border-sky-200"
                >
                  Pass #2 (Priya Patel - Approved)
                </button>
                <button
                  onClick={() => verifyToken('SVM-4-DEMO')}
                  className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold hover:bg-sky-100 border border-sky-200"
                >
                  Pass #4 (Sunita Rao - Approved)
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-xs font-medium">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        ) : (
          /* Verification Result Card */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
                  {scannedVisit.visitor_name?.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{scannedVisit.visitor_name}</h4>
                  <p className="text-xs text-slate-500">{scannedVisit.visitor_org || 'Independent Visitor'}</p>
                </div>
              </div>
              <VisitorStatusBadge status={scannedVisit.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Host & Department</span>
                <p className="font-semibold text-slate-800">{scannedVisit.host_name || 'Campus Gate'}</p>
                <p className="text-slate-500">{scannedVisit.department_name || 'General'}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Purpose of Visit</span>
                <p className="font-semibold text-slate-800">{scannedVisit.purpose}</p>
                <p className="text-slate-500">Duration: {scannedVisit.duration}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Expected Date & Time</span>
                <p className="font-semibold text-slate-800">{scannedVisit.expected_date}</p>
                <p className="text-slate-500">{scannedVisit.expected_time}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Vehicle & Notes</span>
                <p className="font-semibold text-slate-800">{scannedVisit.vehicle_number || 'No Vehicle'}</p>
                <p className="text-slate-500">{scannedVisit.notes || 'No extra notes'}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              {scannedVisit.status === 'approved' && (
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <UserCheck className="w-5 h-5" />
                  <span>✓ Verify & Check In</span>
                </button>
              )}

              {scannedVisit.status === 'checked_in' && (
                <button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-5 h-5 text-sky-400" />
                  <span>Check Out Visitor</span>
                </button>
              )}

              <button
                onClick={resetScanner}
                className="py-3 px-5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>↻ Scan Another</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
