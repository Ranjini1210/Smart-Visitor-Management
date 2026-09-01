import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  KeyRound,
  Shield,
  Briefcase,
  Building2,
  Users,
  CheckCircle2,
  X,
  Sparkles,
  UserPlus,
  Compass,
  Key,
  Delete
} from 'lucide-react';
import { UserRole } from '../types';

interface AccountProfile {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  pin: string;
  deptOrGate: string;
  phone: string;
  description: string;
  badgeColor: string;
  avatarBg: string;
  initials: string;
}

export const Login: React.FC = () => {
  const { login, loginWithPin, loginAsVisitor } = useAuth();
  const navigate = useNavigate();

  // Mode: 'pin-select' | 'standard-email'
  const [loginMode, setLoginMode] = useState<'pin-select' | 'standard-email'>('pin-select');

  // Selected profile for PIN modal
  const [selectedProfile, setSelectedProfile] = useState<AccountProfile | null>(null);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Dynamic Visitor State
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [visitorName, setVisitorName] = useState('Rahul Sharma');
  const [visitorPhone, setVisitorPhone] = useState('+91 91234 56789');
  const [visitorOrg, setVisitorOrg] = useState('TechCorp Solutions');
  const [visitorLoading, setVisitorLoading] = useState(false);

  // Standard Email/Password form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1 Admin Account
  const adminAccount: AccountProfile = {
    id: 1,
    name: 'Dr. Rajesh Sharma',
    email: 'admin@campus.edu',
    role: 'admin',
    pin: '1234',
    deptOrGate: 'Campus Administration & Dean Office',
    phone: '+91 98765 43210',
    description: 'Full Campus Authority & System Oversight',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    avatarBg: 'from-purple-600 to-indigo-600',
    initials: 'RS'
  };

  // 4 Host Accounts
  const hostAccounts: AccountProfile[] = [
    {
      id: 2,
      name: 'Prof. Ananya Verma',
      email: 'ananya.verma@campus.edu',
      role: 'host',
      pin: '1111',
      deptOrGate: 'Computer Science & Engineering',
      phone: '+91 98765 43212',
      description: 'Host for Academic & Technical Visitors',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      avatarBg: 'from-sky-500 to-blue-600',
      initials: 'AV'
    },
    {
      id: 3,
      name: 'Dr. Vikramaditya Rao',
      email: 'vikram.rao@campus.edu',
      role: 'host',
      pin: '2222',
      deptOrGate: 'Research & Innovation Cell',
      phone: '+91 98765 43213',
      description: 'Host for Industry & Research Partners',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      avatarBg: 'from-indigo-500 to-violet-600',
      initials: 'VR'
    },
    {
      id: 4,
      name: 'Prof. Meera Nambiar',
      email: 'meera.nambiar@campus.edu',
      role: 'host',
      pin: '3333',
      deptOrGate: 'Electronics & Communication',
      phone: '+91 98765 43214',
      description: 'Host for Hardware Labs & Seminars',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      avatarBg: 'from-blue-500 to-cyan-600',
      initials: 'MN'
    },
    {
      id: 5,
      name: 'Dr. Arjun Sengupta',
      email: 'arjun.sengupta@campus.edu',
      role: 'host',
      pin: '4444',
      deptOrGate: 'Admissions & Human Resources',
      phone: '+91 98765 43215',
      description: 'Host for Recruitment & New Admissions',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      avatarBg: 'from-teal-500 to-emerald-600',
      initials: 'AS'
    }
  ];

  // 2 Security Accounts
  const securityAccounts: AccountProfile[] = [
    {
      id: 6,
      name: 'Officer Suresh Nair',
      email: 'suresh.nair@campus.edu',
      role: 'security',
      pin: '5555',
      deptOrGate: 'Main Entrance (Gate 1 Checkpoint)',
      phone: '+91 98765 43211',
      description: 'Primary Vehicle & Pedestrian Ingress',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      avatarBg: 'from-amber-500 to-orange-600',
      initials: 'SN'
    },
    {
      id: 7,
      name: 'Officer Kavita Deshmukh',
      email: 'kavita.deshmukh@campus.edu',
      role: 'security',
      pin: '6666',
      deptOrGate: 'North Tower (Gate 2 Checkpoint)',
      phone: '+91 98765 43216',
      description: 'Vendor & VIP Arrival Station',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      avatarBg: 'from-emerald-500 to-teal-600',
      initials: 'KD'
    }
  ];

  const openPinModal = (profile: AccountProfile) => {
    setSelectedProfile(profile);
    setPinInput('');
    setPinError(null);
  };

  const closePinModal = () => {
    setSelectedProfile(null);
    setPinInput('');
    setPinError(null);
  };

  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 6) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setPinError(null);
    }
  };

  const handlePinBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setPinError(null);
  };

  const handlePinSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedProfile) return;
    if (!pinInput.trim()) {
      setPinError('Please enter your 4-digit PIN.');
      return;
    }

    setPinLoading(true);
    setPinError(null);

    const result = await loginWithPin(selectedProfile.email, pinInput.trim());
    setPinLoading(false);

    if (result.success) {
      closePinModal();
      navigate('/dashboard');
    } else {
      setPinError(result.message || 'Incorrect PIN code. Please try again.');
    }
  };

  // Instant Visitor Login (No Password/PIN needed)
  const handleInstantVisitorLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setVisitorLoading(true);
    const result = await loginAsVisitor({
      name: visitorName,
      phone: visitorPhone,
      organization: visitorOrg
    });
    setVisitorLoading(false);
    if (result.success) {
      setShowVisitorModal(false);
      navigate('/dashboard');
    }
  };

  // Standard Form Submit
  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await login(email.trim(), password.trim());
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Invalid email or credentials. Access denied.');
    }
  };

  // Listen for keyboard input when PIN modal is open
  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (!selectedProfile) return;
      if (ev.key >= '0' && ev.key <= '9') {
        handlePinDigit(ev.key);
      } else if (ev.key === 'Backspace') {
        handlePinBackspace();
      } else if (ev.key === 'Enter') {
        handlePinSubmit();
      } else if (ev.key === 'Escape') {
        closePinModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProfile, pinInput]);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-x-hidden">
      {/* Background Decorative Ambient Lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-sky-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-sky-400 flex items-center justify-center shadow-md shadow-sky-500/20 text-white font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-none">
                Smart Visitor Management
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Campus Security & Access Control</p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setLoginMode('pin-select')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                loginMode === 'pin-select'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Quick PIN Portal
            </button>
            <button
              onClick={() => setLoginMode('standard-email')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                loginMode === 'standard-email'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Email & Password
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 py-8 z-10 flex-1 flex flex-col justify-center">
        {loginMode === 'pin-select' ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Title Section */}
            <div className="text-center max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-950/80 text-sky-400 border border-sky-800/60 mb-3">
                <KeyRound className="w-3.5 h-3.5" />
                One-Click Account Sign In
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Select Your Profile to Enter
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Click on your assigned name below and enter your 4-digit PIN number. Visitors can enter immediately without any password.
              </p>
            </div>

            {/* 1. Admin & Visitor Priority Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {/* Administrator Profile Card */}
              <div
                onClick={() => openPinModal(adminAccount)}
                className="group relative bg-slate-900/90 hover:bg-slate-850 border border-purple-900/40 hover:border-purple-500/60 rounded-2xl p-5 shadow-lg transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                    {adminAccount.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                        {adminAccount.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800">
                        Admin
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{adminAccount.email}</p>
                    <p className="text-xs text-purple-300/90 font-medium mt-1">
                      {adminAccount.deptOrGate}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-900/40 border border-purple-700/50 text-[11px] font-medium text-purple-300 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-purple-400" />
                    <span>Confidential PIN</span>
                  </span>
                  <span className="text-xs text-slate-400 group-hover:text-purple-300 font-semibold flex items-center gap-1">
                    Enter PIN <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Dynamic Visitor Kiosk Card (No Password Needed!) */}
              <div
                onClick={() => setShowVisitorModal(true)}
                className="group relative bg-gradient-to-br from-emerald-950/50 via-slate-900/90 to-slate-900/90 hover:bg-slate-850 border border-emerald-800/40 hover:border-emerald-500/60 rounded-2xl p-5 shadow-lg transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
                        Visitor Access Portal
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Dynamic
                      </span>
                    </div>
                    <p className="text-xs text-emerald-400 font-medium mt-0.5">
                      ✓ No Password or PIN Required
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Self-service registration & digital pass kiosk
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-900/40 border border-emerald-600/50 text-[11px] font-bold text-emerald-300">
                    Instant Access
                  </span>
                  <span className="text-xs text-emerald-400 group-hover:translate-x-0.5 font-semibold flex items-center gap-1 transition-transform">
                    Enter Now <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Four (4) Host Accounts Section */}
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Faculty & Department Hosts (4)
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Click name to enter 4-digit host PIN</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {hostAccounts.map((host) => (
                  <div
                    key={host.id}
                    onClick={() => openPinModal(host)}
                    className="group bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/60 rounded-2xl p-4.5 transition-all cursor-pointer flex flex-col justify-between relative shadow-md hover:shadow-sky-500/10"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${host.avatarBg} flex items-center justify-center text-white font-bold text-sm shadow-md`}
                        >
                          {host.initials}
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-950 text-sky-300 border border-sky-800">
                          Host
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm group-hover:text-sky-300 transition-colors">
                        {host.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{host.email}</p>
                      <div className="mt-2.5 pt-2 border-t border-slate-800">
                        <span className="text-[11px] font-medium text-sky-400 block line-clamp-1">
                          {host.deptOrGate}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] font-medium text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-sky-400" />
                        <span>Host PIN</span>
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 group-hover:text-sky-300 flex items-center gap-0.5">
                        Log In <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Two (2) Security Personnel Section */}
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Security Checkpoints & Gate Staff (2)
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Click name to enter guard station PIN</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {securityAccounts.map((sec) => (
                  <div
                    key={sec.id}
                    onClick={() => openPinModal(sec)}
                    className="group bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-4.5 transition-all cursor-pointer flex items-center justify-between shadow-md hover:shadow-amber-500/10"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sec.avatarBg} flex items-center justify-center text-white font-bold text-sm shadow-md`}
                      >
                        {sec.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                            {sec.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-800">
                            Security
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{sec.email}</p>
                        <p className="text-xs text-amber-400/90 font-medium mt-1">
                          {sec.deptOrGate}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className="px-2.5 py-1 rounded-md bg-amber-950/60 border border-amber-800/40 text-[11px] font-medium text-amber-400 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>Guard PIN</span>
                      </span>
                      <span className="text-xs text-slate-400 group-hover:text-amber-300 font-semibold flex items-center gap-1">
                        Enter PIN <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Standard Email & Password Login Form */
          <div className="max-w-md mx-auto w-full bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 px-8 py-8 text-white text-center relative">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center shadow-lg shadow-sky-500/30 mb-3">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">Standard Credentials Login</h2>
              <p className="text-xs text-sky-300/80 font-medium mt-1">
                Enter your campus email address and password or PIN
              </p>
            </div>

            <div className="p-8">
              <form onSubmit={handleStandardSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. admin@campus.edu or ananya.verma@campus.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Password or PIN
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter password or 4-digit PIN"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <button
                  onClick={() => setLoginMode('pin-select')}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700"
                >
                  ← Switch back to Quick PIN selection
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-900/40 py-3 text-center text-xs text-slate-400 z-10">
        Enterprise Campus Access Management • All credentials & PINs are verified securely
      </footer>

      {/* ======================================================== */}
      {/* PIN Code Verification Modal */}
      {/* ======================================================== */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative">
            {/* Close Button */}
            <button
              onClick={closePinModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="p-6 text-center border-b border-slate-800">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedProfile.avatarBg} mx-auto flex items-center justify-center text-white text-xl font-extrabold shadow-lg mb-3`}
              >
                {selectedProfile.initials}
              </div>
              <h3 className="font-extrabold text-lg text-white">{selectedProfile.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{selectedProfile.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-sky-400 border border-slate-700">
                <span>{selectedProfile.deptOrGate}</span>
              </div>
            </div>

            {/* PIN Entry Area */}
            <div className="p-6">
              <div className="text-center mb-4">
                <p className="text-xs text-slate-400 font-medium">Enter 4-Digit Security PIN</p>
                {/* 4 PIN Dots/Boxes */}
                <div className="flex items-center justify-center gap-3 my-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all ${
                        pinInput.length > idx
                          ? 'border-sky-500 bg-sky-950/60 text-sky-400 shadow-sm shadow-sky-500/20'
                          : idx === pinInput.length
                          ? 'border-slate-500 bg-slate-800/80 text-white animate-pulse'
                          : 'border-slate-800 bg-slate-800/40 text-slate-600'
                      }`}
                    >
                      {pinInput.length > idx ? '●' : ''}
                    </div>
                  ))}
                </div>

                {/* Confidential Security Notice */}
                <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 mt-2 bg-slate-800/60 py-1.5 px-3 rounded-lg border border-slate-700/50">
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  <span>PIN is confidential. Only the authorized account holder should know it.</span>
                </p>
              </div>

              {pinError && (
                <div className="mb-4 p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs font-semibold text-rose-300 text-center">
                  {pinError}
                </div>
              )}

              {/* On-Screen Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto mb-4">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinDigit(num)}
                    className="h-12 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-white font-bold text-lg border border-slate-700/60 transition-all"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPinInput('')}
                  className="h-12 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 text-xs font-bold uppercase transition-all"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handlePinDigit('0')}
                  className="h-12 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-white font-bold text-lg border border-slate-700/60 transition-all"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handlePinBackspace}
                  className="h-12 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-all"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={() => handlePinSubmit()}
                disabled={pinLoading || pinInput.length < 4}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  pinInput.length >= 4
                    ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {pinLoading ? (
                  <span>Verifying PIN...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Dynamic Visitor Access Modal */}
      {/* ======================================================== */}
      {showVisitorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative">
            <button
              onClick={() => setShowVisitorModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border-b border-slate-800 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mx-auto flex items-center justify-center text-white shadow-lg mb-3">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-xl text-white">Visitor Access Portal</h3>
              <p className="text-xs text-emerald-400 font-medium mt-1">
                No password or PIN required to enter
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <p className="font-bold text-emerald-300">Instant Self-Service Pass</p>
                  <p className="mt-0.5 text-slate-400">
                    You can enter as a guest visitor instantly, or specify your details to generate your personal digital badge.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Visitor Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={visitorPhone}
                      onChange={(e) => setVisitorPhone(e.target.value)}
                      placeholder="+91 91234 56789"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={visitorOrg}
                      onChange={(e) => setVisitorOrg(e.target.value)}
                      placeholder="TechCorp Solutions"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleInstantVisitorLogin}
                disabled={visitorLoading}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                <span>{visitorLoading ? 'Entering Portal...' : 'Continue to Visitor Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
