import React, { useState } from 'react';
import { CheckCircle2, Clock, ShieldAlert, Camera, ArrowRight, AlertTriangle, FileText, UploadCloud, Loader2 } from 'lucide-react';
import { Order, Role } from '../types';
import { api } from '../services/api';

interface OrderMilestonesViewProps {
  orders: Order[];
  userRole: Role;
  onRefresh: () => void;
}

export const OrderMilestonesView: React.FC<OrderMilestonesViewProps> = ({
  orders,
  userRole,
  onRefresh
}) => {
  const [activeOrderId, setActiveOrderId] = useState<string | null>(orders[0]?._id || null);
  const [selectedMilestone, setSelectedMilestone] = useState<any | null>(null);
  const [disputeModalOrder, setDisputeModalOrder] = useState<Order | null>(null);
  const [disputeNotes, setDisputeNotes] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  // Milestone edit state
  const [milestoneNotes, setMilestoneNotes] = useState('');
  const [milestoneEvidenceUrl, setMilestoneEvidenceUrl] = useState('');
  const [milestoneDefectRate, setMilestoneDefectRate] = useState<number | ''>(0);
  const [isUpdatingMilestone, setIsUpdatingMilestone] = useState(false);

  const activeOrder = orders.find(o => o._id === activeOrderId) || orders[0];

  const handleOpenMilestoneEditor = (milestone: any) => {
    setSelectedMilestone(milestone);
    setMilestoneNotes(milestone.notes || '');
    setMilestoneEvidenceUrl(milestone.evidenceUrl || '');
    setMilestoneDefectRate(milestone.defectRatePercent !== null ? milestone.defectRatePercent : 0);
  };

  const handleSaveMilestone = async () => {
    if (!activeOrder || !selectedMilestone) return;
    setIsUpdatingMilestone(true);
    try {
      await api.updateMilestone(activeOrder._id, {
        stage: selectedMilestone.stage,
        completed: true,
        notes: milestoneNotes,
        evidenceUrl: milestoneEvidenceUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
        defectRatePercent: Number(milestoneDefectRate)
      });
      setSelectedMilestone(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingMilestone(false);
    }
  };

  const handleSubmitDispute = async () => {
    if (!disputeModalOrder) return;
    setIsSubmittingDispute(true);
    try {
      await api.openDispute(disputeModalOrder._id, {
        category: 'spec_deviation',
        notes: disputeNotes,
        evidence: disputeEvidence
      });
      setDisputeModalOrder(null);
      setDisputeNotes('');
      setDisputeEvidence('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Production Milestones & Evidence Trail</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Order Milestone Tracker
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Verify each production stage with inspection logs, defect rate recordings, and timestamped factory photos.
            </p>
          </div>

          {activeOrder && activeOrder.status !== 'disputed' && (
            <button
              onClick={() => setDisputeModalOrder(activeOrder)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30 transition-all flex items-center space-x-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Open Spec Dispute</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Order View */}
      {activeOrder ? (
        <div className="space-y-6">
          {/* Order Header Summary */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
                  <span className="font-mono text-emerald-400 font-bold">Order #{activeOrder._id.slice(0, 8)}</span>
                  <span className="text-slate-600 hidden xs:inline">•</span>
                  <span className="text-slate-400">Buyer: <strong className="text-white">{activeOrder.buyerName}</strong></span>
                  <span className="text-slate-600 hidden sm:inline">•</span>
                  <span className="text-slate-400 block sm:inline">Factory: <strong className="text-white">{activeOrder.manufacturerName}</strong></span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                  Small-Batch Production Contract
                </h2>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <div className="text-left sm:text-right">
                  <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">Total Contract</div>
                  <div className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">₹{activeOrder.total?.toLocaleString()}</div>
                </div>
                <span className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                  activeOrder.status === 'disputed'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {activeOrder.status}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              7-Stage Quality Milestone Trail
            </h3>

            <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-7 pl-4 sm:pl-6 space-y-4 sm:space-y-6 py-2">
              {activeOrder.milestones.map((milestone, idx) => {
                return (
                  <div key={milestone.stage} className="relative group">
                    {/* Step Icon Node */}
                    <div
                      className={`absolute -left-[27px] sm:-left-[35px] top-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        milestone.completed
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md sm:shadow-lg shadow-emerald-500/30'
                          : 'bg-slate-900 border-slate-700 text-slate-500'
                      }`}
                    >
                      {milestone.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                      ) : (
                        <span className="text-[10px] sm:text-xs font-bold">{idx + 1}</span>
                      )}
                    </div>

                    {/* Milestone Card */}
                    <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-white text-base">{milestone.title}</h4>
                            {milestone.completed && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                                Completed
                              </span>
                            )}
                          </div>
                          {milestone.timestamp && (
                            <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{new Date(milestone.timestamp).toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Defect rate tag if present */}
                        {milestone.defectRatePercent !== null && milestone.defectRatePercent !== undefined && (
                          <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                            <span className="text-slate-400">Defect Rate: </span>
                            <span className={`font-mono font-bold ${milestone.defectRatePercent <= 1.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {milestone.defectRatePercent}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {milestone.notes && (
                        <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                          {milestone.notes}
                        </p>
                      )}

                      {/* Evidence Photo */}
                      {milestone.evidenceUrl && (
                        <div className="pt-2">
                          <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center space-x-1">
                            <Camera className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Timestamped Inspection Photo</span>
                          </div>
                          <img
                            src={milestone.evidenceUrl}
                            alt="Milestone inspection"
                            className="rounded-xl border border-slate-700 h-44 w-full sm:w-80 object-cover shadow-lg"
                          />
                        </div>
                      )}

                      {/* Edit / Update Button (for manufacturer/admin or buyer review) */}
                      {(userRole === 'manufacturer' || userRole === 'admin') && (
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleOpenMilestoneEditor(milestone)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5"
                          >
                            <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{milestone.completed ? 'Update Evidence' : 'Record & Complete Stage'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 glass-panel rounded-2xl">
          No confirmed orders currently active.
        </div>
      )}

      {/* Milestone Evidence Update Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white">Record Milestone Evidence</h3>
            <p className="text-xs text-slate-400 mt-1">{selectedMilestone.title}</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Stage Progress Notes:</label>
                <textarea
                  value={milestoneNotes}
                  onChange={e => setMilestoneNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Cutting 100% completed. Passed pre-wash AQL inspection."
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Evidence / Photo URL:</label>
                <input
                  type="text"
                  value={milestoneEvidenceUrl}
                  onChange={e => setMilestoneEvidenceUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">QC Defect Rate (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={milestoneDefectRate}
                  onChange={e => setMilestoneDefectRate(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedMilestone(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMilestone}
                disabled={isUpdatingMilestone}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center space-x-1.5"
              >
                {isUpdatingMilestone ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save & Sign Off</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Open Dispute Modal */}
      {disputeModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center space-x-2 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Open Specification Dispute</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              File a formal dispute with inspection evidence. Admin CQO team will freeze milestones and review within 24 hours.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Dispute Details:</label>
                <textarea
                  value={disputeNotes}
                  onChange={e => setDisputeNotes(e.target.value)}
                  rows={3}
                  placeholder="Describe the discrepancy against the approved spec sheet..."
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Evidence Link / Photo Reference:</label>
                <input
                  type="text"
                  value={disputeEvidence}
                  onChange={e => setDisputeEvidence(e.target.value)}
                  placeholder="e.g. DOC-EVID-DEFECT-882"
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => setDisputeModalOrder(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDispute}
                disabled={isSubmittingDispute || !disputeNotes.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white"
              >
                {isSubmittingDispute ? 'Submitting...' : 'Submit to Admin Queue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
