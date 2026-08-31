import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { Department, AuditLogItem } from '../types';
import { Settings, Shield, Plus, Building2, FileText, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [activeTab, setActiveTab] = useState<'depts' | 'logs' | 'system'>('depts');
  const { showToast } = useNotifications();

  const loadSettingsData = async () => {
    try {
      const [deptsRes, logsRes] = await Promise.all([
        api.get('/settings/departments').catch(() => null),
        api.get('/settings/audit-logs').catch(() => null)
      ]);
      if (deptsRes?.data?.success) setDepartments(deptsRes.data.data);
      if (logsRes?.data?.success) setAuditLogs(logsRes.data.data);
    } catch {}
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    try {
      const res = await api.post('/settings/departments', { name: newDeptName.trim() });
      if (res.data.success) {
        showToast('Department added successfully!', 'success');
        setNewDeptName('');
        loadSettingsData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to add department', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">System Administration & Settings</h2>
          <p className="text-xs text-slate-500">Configure security parameters, campus departments, and view audit history</p>
        </div>
        <div className="p-3 rounded-2xl bg-sky-50 text-sky-600">
          <Settings className="w-6 h-6" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('depts')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'depts' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Departments Management
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'logs' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          System Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'system' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Security & QR Parameters
        </button>
      </div>

      {/* Tab 1: Departments */}
      {activeTab === 'depts' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-900 mb-4">Add New Department</h3>
            <form onSubmit={handleAddDept} className="flex gap-3 max-w-md">
              <input
                type="text"
                required
                placeholder="e.g. Electrical & Electronics Engineering"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">Campus Departments Directory</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {departments.map((dept) => (
                <div key={dept.id} className="p-4 px-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-sky-600" />
                    <span className="font-bold text-xs text-slate-900">{dept.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Dept ID #{dept.id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">System Security Audit Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono font-bold text-sky-700">{log.action}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{log.user_name || 'System / Visitor'}</td>
                    <td className="px-6 py-4 text-slate-600">{log.details}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Security & QR Parameters */}
      {activeTab === 'system' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">Security Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-slate-700">QR Code Token Expiration</span>
              <p className="text-slate-500">Default: 24 Hours after issuance</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-slate-700">JWT Token Security</span>
              <p className="text-slate-500">Algorithm: HS256 with 24h expiration</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-slate-700">Redis Active State Engine</span>
              <p className="text-slate-500">Status: Active (with in-memory fallback)</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-slate-700">Database Synchronization</span>
              <p className="text-slate-500">PostgreSQL Relational Storage</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
