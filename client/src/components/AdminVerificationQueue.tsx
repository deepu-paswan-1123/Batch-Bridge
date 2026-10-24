import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, FileText, Plus, Clock, Search, ArrowRight, Loader2 } from 'lucide-react';
import { VerificationCheck, Manufacturer, AuditLog } from '../types';
import { api } from '../services/api';

interface AdminVerificationQueueProps {
  manufacturers: Manufacturer[];
  onRefresh: () => void;
}

export const AdminVerificationQueue: React.FC<AdminVerificationQueueProps> = ({
  manufacturers,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'disputes' | 'audit'>('queue');
  const [queue, setQueue] = useState<VerificationCheck[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  // New check modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMfgId, setSelectedMfgId] = useState<string>(manufacturers[0]?._id || '');
  const [checkType, setCheckType] = useState<string>('sample_reviewed');
  const [checkTitle, setCheckTitle] = useState('');
  const [checkScope, setCheckScope] = useState('');
  const [evidenceRef, setEvidenceRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [qRes, dRes, aRes] = await Promise.all([
        api.getVerificationQueue(),
        api.getDisputes(),
        api.getAuditLogs()
      ]);
      setQueue(qRes.queue || []);
      setDisputes(dRes.disputes || []);
      setAuditLogs(aRes.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMfgId || !checkTitle) return;
    setIsSubmitting(true);
    try {
      await api.recordVerificationCheck(selectedMfgId, {
        checkType,
        title: checkTitle,
        scope: checkScope,
        evidenceRef: evidenceRef || `DOC-AUDIT-${Date.now().toString().slice(-6)}`
      });
      setShowAddModal(false);
      setCheckTitle('');
      setCheckScope('');
      setEvidenceRef('');
      loadData();
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveDispute = async (id: string) => {
    try {
      await api.resolveDispute(id, {
        status: 'resolved',
        resolution: 'Admin reviewed garment lab shrinkage tests and confirmed 1.8% variance within agreed tolerance.'
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Trust & Governance Desk</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Evidence Review Queue & Audit Log
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Enforce rigorous small-batch manufacturing standards. A registration document alone is never proof of quality.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center space-x-2 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Grant Granular Verification</span>
          </button>
        </div>

        {/* Sub-nav Tabs (Scrollable on small devices) */}
        <div className="flex items-center space-x-2 mt-4 sm:mt-6 pt-4 border-t border-slate-800 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'queue'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Verification Checks ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'disputes'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Order Disputes ({disputes.filter(d => d.status === 'open').length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'audit'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Trail ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Tab Content: Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {queue.map(check => (
              <div key={check._id} className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {check.checkType.replace('_', ' ')}
                    </span>
                    <h3 className="font-bold text-white text-base mt-2">{check.title}</h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Factory: <strong className="text-slate-200">{check.manufacturerName}</strong>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] text-emerald-400 font-bold bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    {check.evidenceRef}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Audit Scope Documented:</div>
                  {check.scope}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Reviewed by: <strong className="text-slate-300">{check.checkedBy}</strong></span>
                  <span>{new Date(check.checkedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Disputes */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          {disputes.length > 0 ? (
            disputes.map(dispute => (
              <div key={dispute._id} className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {dispute.status}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">Order #{dispute.orderId.slice(0, 8)}</span>
                    </div>
                    <h3 className="font-bold text-white text-base mt-1.5">Category: {dispute.category}</h3>
                  </div>

                  {dispute.status === 'open' && (
                    <button
                      onClick={() => handleResolveDispute(dispute._id)}
                      className="w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 text-center"
                    >
                      Arbitrate & Resolve
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-950 text-xs text-slate-300 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Issue Details:</div>
                  {dispute.notes}
                  {dispute.resolution && (
                    <div className="mt-2 pt-2 border-t border-slate-800 text-emerald-400 font-medium">
                      ✓ Resolution: {dispute.resolution}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 glass-panel rounded-2xl">
              No active disputes currently filed.
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Mobile Card View (< 768px) */}
          <div className="md:hidden space-y-2.5">
            {auditLogs.map(log => (
              <div key={log._id} className="glass-panel p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 font-mono text-[11px]">{log.action}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Entity: <strong className="text-slate-200 uppercase">{log.entityType}</strong></span>
                  <span className="font-mono text-[10px] text-slate-500">{log.entityId}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= 768px) */}
          <div className="hidden md:block glass-card rounded-2xl overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Entity ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {auditLogs.map(log => (
                    <tr key={log._id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400 font-mono">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-slate-300 uppercase">
                        {log.entityType}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {log.entityId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Grant Verification Check Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white">Record Verification Check</h3>
            <p className="text-xs text-slate-400 mt-1">Assign an evidence-backed trust label to a manufacturer.</p>

            <form onSubmit={handleRecordCheck} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Select Manufacturer:</label>
                <select
                  value={selectedMfgId}
                  onChange={e => setSelectedMfgId(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {manufacturers.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.businessName} ({m.location.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Check Category:</label>
                <select
                  value={checkType}
                  onChange={e => setCheckType(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="identity_checked">Identity Checked (Statutory & GST)</option>
                  <option value="capability_evidence">Capability Evidence (Machinery Audit)</option>
                  <option value="sample_reviewed">Sample Reviewed (Physical Shrinkage/Lab)</option>
                  <option value="production_history">Production History (Challans & E-Way)</option>
                  <option value="inspection_recorded">Inspection Recorded (AQL PSI Report)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Check Title:</label>
                <input
                  type="text"
                  value={checkTitle}
                  onChange={e => setCheckTitle(e.target.value)}
                  placeholder="e.g. 240 GSM Fabric Shrinkage & Rubbing Fastness Test"
                  required
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Scope Documented:</label>
                <textarea
                  value={checkScope}
                  onChange={e => setCheckScope(e.target.value)}
                  rows={2}
                  placeholder="Exact verification scope checked..."
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Evidence ID / Ref:</label>
                <input
                  type="text"
                  value={evidenceRef}
                  onChange={e => setEvidenceRef(e.target.value)}
                  placeholder="e.g. LAB-TEST-RJ-2026-99"
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="mt-5 flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center space-x-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Record & Publish Check</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
