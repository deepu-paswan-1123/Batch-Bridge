import React from 'react';
import { Sparkles, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { MatchResult } from '../types';

interface MatchExplainerModalProps {
  match: MatchResult | null;
  onClose: () => void;
  onInvite: (manufacturerId: string) => void;
}

const WEIGHT_LABELS = [
  { key: 'capability', label: 'Capability Fit', weight: '30%', desc: 'Process, material & tooling match' },
  { key: 'moq', label: 'MOQ Compatibility', weight: '20%', desc: 'Practical batch size sweet-spot' },
  { key: 'quality', label: 'Quality Evidence', weight: '20%', desc: 'Verified audits & past run history' },
  { key: 'leadTime', label: 'Lead Time Fit', weight: '15%', desc: 'Factory timeline vs. required deadline' },
  { key: 'budget', label: 'Budget Feasibility', weight: '10%', desc: 'Estimated unit cost fit' },
  { key: 'location', label: 'Logistics Proximity', weight: '5%', desc: 'Regional transit and cluster speed' }
];

export const MatchExplainerModal: React.FC<MatchExplainerModalProps> = ({
  match,
  onClose,
  onInvite
}) => {
  if (!match) return null;

  const { manufacturer, score, parts, verifiedChecks, reasons, aiExplanation } = match;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Transparent Weighted Match Engine</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5">{manufacturer.businessName}</h2>
            <p className="text-xs text-slate-400">
              {manufacturer.location.cluster || `${manufacturer.location.city}, ${manufacturer.location.state}`}
            </p>
          </div>

          <div className="text-right flex items-center space-x-3">
            <div className="px-3 py-1.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30">
              <div className="text-[10px] uppercase font-bold text-slate-400">Overall Match</div>
              <div className="text-2xl font-black text-emerald-400">{score}%</div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Plain-Language Explainer */}
        {aiExplanation && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-emerald-500/20 space-y-2">
            <div className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Why this factory fits your small batch</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {aiExplanation.summary}
            </p>

            <div className="mt-2 space-y-1">
              {aiExplanation.strengths.map((str, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{str}</span>
                </div>
              ))}
            </div>

            {aiExplanation.considerations?.length > 0 && (
              <div className="mt-3 pt-2 border-t border-slate-800 space-y-1">
                <div className="text-[11px] font-semibold text-amber-400 flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>Key Points to Note:</span>
                </div>
                {aiExplanation.considerations.map((c, i) => (
                  <div key={i} className="text-[11px] text-slate-400 pl-4">
                    • {c}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Weighted Score Breakdown Matrix */}
        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Algorithmic Scoring Breakdown (Node.js Service)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WEIGHT_LABELS.map(w => {
              const val = (parts as any)[w.key];
              return (
                <div key={w.key} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{w.label}</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {val !== null && val !== undefined ? `${val}%` : 'Pending quote'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{w.desc} (Weight: {w.weight})</div>

                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${val || 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verified Evidence Checkpoints on File */}
        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audited Evidence on File ({verifiedChecks.length})</span>
          </h3>
          <div className="space-y-2">
            {verifiedChecks.map(check => (
              <div key={check._id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">{check.title}</div>
                  <div className="text-[10px] text-slate-400">{check.scope}</div>
                </div>
                <div className="text-right font-mono text-[10px] text-emerald-400">
                  {check.evidenceRef}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
          >
            Close
          </button>
          <button
            onClick={() => {
              onInvite(manufacturer._id);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center space-x-2"
          >
            <span>Invite Factory to Quote</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
