import React, { useState } from 'react';
import { Sparkles, BarChart3, Plus, ArrowRight } from 'lucide-react';
import { Requirement, Role, MatchResult } from '../types';
import { api } from '../services/api';

interface RequirementsViewProps {
  requirements: Requirement[];
  userRole: Role;
  onOpenNewBrief: () => void;
  onViewMatches: (matches: MatchResult[], req: Requirement) => void;
  onCompareQuotes: (req: Requirement) => void;
  onSubmitQuote: (req: Requirement) => void;
}

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-slate-800 text-slate-300 border-slate-700' },
  open: { label: 'Open Brief', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  matching: { label: 'AI Matching', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  quotes_received: { label: 'Quotes Received', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  sample_stage: { label: 'Sample Stage', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  awarded: { label: 'Order Awarded', color: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
  closed: { label: 'Closed', color: 'bg-slate-800 text-slate-400 border-slate-700' }
};

export const RequirementsView: React.FC<RequirementsViewProps> = ({
  requirements,
  userRole,
  onOpenNewBrief,
  onViewMatches,
  onCompareQuotes,
  onSubmitQuote
}) => {
  const [matchingReqId, setMatchingReqId] = useState<string | null>(null);

  const handleRunMatching = async (req: Requirement) => {
    setMatchingReqId(req._id);
    try {
      const res = await api.matchManufacturersAi(req, req._id);
      if (res.matches) {
        onViewMatches(res.matches, req);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMatchingReqId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Manufacturing Briefs & RFPs
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Structured production requirements with transparent tolerances, tech packs, and ranked factory matches.
          </p>
        </div>

        {userRole === 'buyer' && (
          <button
            onClick={onOpenNewBrief}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 flex-shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create AI Brief</span>
          </button>
        )}
      </div>

      {/* Requirements List */}
      <div className="space-y-4">
        {requirements.map(req => {
          const badge = STATUS_BADGES[req.status] || { label: req.status, color: 'bg-slate-800 text-slate-400' };
          return (
            <div key={req._id} className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-800">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2.5 max-w-3xl">
                  {/* Status Badges */}
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {req.category}
                    </span>
                    <span className="text-slate-600 hidden xs:inline">•</span>
                    <span className="text-xs text-slate-400">
                      Posted by <strong className="text-slate-300">{req.businessName || req.buyerName || 'Buyer'}</strong>
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base sm:text-lg font-bold text-white hover:text-emerald-400 transition-colors">
                    {req.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {req.description}
                  </p>

                  {/* Specs & Metrics Grid (Mobile 2x2, Tablet/Desktop 4-col) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-1 text-xs">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Quantity</span>
                      <span className="font-bold text-white text-xs sm:text-sm">{req.quantity.toLocaleString()} units</span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Target Budget</span>
                      <span className="font-bold text-emerald-400 text-xs sm:text-sm">₹{req.budget || 200}/unit</span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Turnaround</span>
                      <span className="font-bold text-white text-xs sm:text-sm">{req.deadlineDays} days</span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Cluster / City</span>
                      <span className="font-bold text-white text-xs sm:text-sm truncate block">{req.location.city}</span>
                    </div>
                  </div>
                </div>

                {/* Touch-Friendly Action Buttons */}
                <div className="w-full lg:w-auto grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800/80 flex-shrink-0">
                  <button
                    onClick={() => handleRunMatching(req)}
                    disabled={matchingReqId === req._id}
                    className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{matchingReqId === req._id ? 'Ranking Engines...' : 'Ranked Matches'}</span>
                  </button>

                  <button
                    onClick={() => onCompareQuotes(req)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center space-x-1.5"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>Compare Quotes ({req.quotesCount || 2})</span>
                  </button>

                  {userRole === 'manufacturer' && (
                    <button
                      onClick={() => onSubmitQuote(req)}
                      className="w-full col-span-1 sm:col-span-2 lg:col-span-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Submit Quote</span>
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
