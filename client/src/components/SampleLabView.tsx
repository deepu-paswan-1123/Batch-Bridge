import React, { useState } from 'react';
import { Package, Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Sample, Role } from '../types';
import { api } from '../services/api';

interface SampleLabViewProps {
  samples: Sample[];
  userRole: Role;
  onRefresh: () => void;
  onAdvanceToOrder: (sample: Sample) => void;
}

const SAMPLE_STAGES = [
  { id: 'requested', label: 'Requested' },
  { id: 'confirmed', label: 'Spec Locked' },
  { id: 'dispatched', label: 'Dispatched' },
  { id: 'received', label: 'Received' },
  { id: 'approved', label: 'Approved' }
];

export const SampleLabView: React.FC<SampleLabViewProps> = ({
  samples,
  onRefresh,
  onAdvanceToOrder
}) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateStatus = async (sampleId: string, newStatus: string) => {
    setUpdatingId(sampleId);
    try {
      await api.updateSample(sampleId, { status: newStatus });
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-2">
          <Package className="w-4 h-4" />
          <span>Pre-Production Quality Gate</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Sample Validation Lab
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Never order bulk manufacturing without written spec approval. Track physical sample swatches, dimensional shrinkage tests, and courier dispatch before locking production line slots.
        </p>
      </div>

      {/* Samples List */}
      <div className="space-y-4">
        {samples.map(sample => {
          const currentStageIndex = SAMPLE_STAGES.findIndex(s => s.id === sample.status);

          return (
            <div key={sample._id} className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-mono text-emerald-400 font-bold">Sample #{sample._id.slice(0, 8)}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">Spec Version: <strong>{sample.approvedSpecVersion || 'v1.0'}</strong></span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    Pre-Production Benchmark Sample
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Sample Fee:</span>
                  <span className="text-sm font-bold text-white px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                    ₹{sample.fee}
                  </span>
                </div>
              </div>

              {/* Horizontal Stepper (Scrollable on mobile/tablet, grid on desktop) */}
              <div className="py-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 sm:hidden flex items-center justify-between">
                  <span>Validation Progress</span>
                  <span className="text-purple-400">Swipe →</span>
                </div>
                <div className="flex sm:grid sm:grid-cols-5 gap-2 overflow-x-auto pb-2 sm:pb-0">
                  {SAMPLE_STAGES.map((stage, idx) => {
                    const isDone = currentStageIndex >= idx;
                    const isCurrent = currentStageIndex === idx;

                    return (
                      <div
                        key={stage.id}
                        className={`p-2.5 rounded-xl border text-center transition-all min-w-[120px] sm:min-w-0 flex-1 flex-shrink-0 ${
                          isCurrent
                            ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 ring-1 ring-purple-500/40'
                            : isDone
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-slate-950/60 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="text-[9px] uppercase font-bold tracking-wider">Step {idx + 1}</div>
                        <div className="text-xs font-semibold mt-0.5">{stage.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Courier & Tracking Details */}
              <div className="p-3 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-purple-400 flex-shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-400">Courier Tracking:</div>
                    <div className="font-mono font-bold text-slate-200">
                      {sample.carrier ? `${sample.carrier} - ${sample.trackingNumber}` : 'Tracking pending dispatch'}
                    </div>
                  </div>
                </div>

                {sample.feedback && (
                  <div className="text-left sm:text-right">
                    <div className="text-slate-400">Quality Remarks:</div>
                    <div className="text-slate-300 italic">{sample.feedback}</div>
                  </div>
                )}
              </div>

              {/* Action Bar (Full width on mobile) */}
              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Current Status: <strong className="text-white capitalize">{sample.status}</strong>
                </span>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {sample.status === 'requested' && (
                    <button
                      onClick={() => handleUpdateStatus(sample._id, 'confirmed')}
                      disabled={updatingId === sample._id}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white text-center"
                    >
                      Confirm Spec & Cut Fabric
                    </button>
                  )}

                  {sample.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(sample._id, 'dispatched')}
                      disabled={updatingId === sample._id}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white text-center"
                    >
                      Mark Dispatched (Courier)
                    </button>
                  )}

                  {sample.status === 'dispatched' && (
                    <button
                      onClick={() => handleUpdateStatus(sample._id, 'received')}
                      disabled={updatingId === sample._id}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white text-center"
                    >
                      Confirm Sample Received
                    </button>
                  )}

                  {sample.status === 'received' && (
                    <button
                      onClick={() => handleUpdateStatus(sample._id, 'approved')}
                      disabled={updatingId === sample._id}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow text-center"
                    >
                      Approve Sample Spec
                    </button>
                  )}

                  {sample.status === 'approved' && (
                    <button
                      onClick={() => onAdvanceToOrder(sample)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-1.5 text-center"
                    >
                      <span>Lock Spec & Confirm Bulk Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
