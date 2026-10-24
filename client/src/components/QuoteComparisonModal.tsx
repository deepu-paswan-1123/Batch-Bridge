import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, X, Layers, Table } from 'lucide-react';
import { Quote, NormalizedQuoteComparison } from '../types';

interface QuoteComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotes: Quote[];
  comparison: NormalizedQuoteComparison[];
  aiNarrative?: string;
  onAcceptQuote: (quoteId: string) => void;
  onRequestSample: (quoteId: string) => void;
}

export const QuoteComparisonModal: React.FC<QuoteComparisonModalProps> = ({
  isOpen,
  onClose,
  comparison,
  aiNarrative,
  onAcceptQuote,
  onRequestSample
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [selectedMobileQuoteIndex, setSelectedMobileQuoteIndex] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 sm:pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Normalised Landed-Cost Analysis</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1">Side-by-Side Quotation Comparison</h2>
            <p className="text-xs text-slate-400 hidden sm:block">
              All line items, setup tooling charges, and freight normalized for accurate true-cost comparison.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Switcher for Tablet / Mobile */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center space-x-1 ${
                  viewMode === 'cards' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Card View"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center space-x-1 ${
                  viewMode === 'table' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Matrix Table View"
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Comparison Narrative Banner */}
        {aiNarrative && (
          <div className="mt-4 p-3 sm:p-4 rounded-xl bg-slate-950/90 border border-emerald-500/20 flex items-start space-x-2.5 sm:space-x-3">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <div className="font-bold text-emerald-300 mb-0.5 text-xs sm:text-sm">AI Quote Variance Analysis</div>
              {aiNarrative}
            </div>
          </div>
        )}

        {/* Mobile Quote Switcher Tabs (when in cards mode on small screens) */}
        {viewMode === 'cards' && (
          <div className="mt-4">
            <div className="flex sm:hidden overflow-x-auto gap-2 pb-2">
              {comparison.map((item, idx) => (
                <button
                  key={item.quoteId}
                  onClick={() => setSelectedMobileQuoteIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedMobileQuoteIndex === idx
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {item.manufacturerName.split(' ')[0]} (₹{item.unitLandedCost})
                </button>
              ))}
            </div>

            {/* Responsive Card Grid (1 col on mobile, 2 col on tablet/desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {comparison.map((item, idx) => {
                const isSelectedOnMobile = selectedMobileQuoteIndex === idx;
                return (
                  <div
                    key={item.quoteId}
                    className={`glass-panel p-4 sm:p-5 rounded-2xl border transition-all ${
                      isSelectedOnMobile ? 'block' : 'hidden sm:block'
                    } border-slate-700 hover:border-emerald-500/50`}
                  >
                    {/* Factory Header */}
                    <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                      <div>
                        <h3 className="font-bold text-base text-white">{item.manufacturerName}</h3>
                        <span className="text-[10px] text-emerald-400 font-mono">Quote #{item.quoteId.slice(0, 8)}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Landed Unit Cost</div>
                        <div className="text-xl font-extrabold text-emerald-400 font-mono">₹{item.unitLandedCost}</div>
                      </div>
                    </div>

                    {/* Cost Breakdown Items */}
                    <div className="py-3 space-y-2 text-xs divide-y divide-slate-800/60">
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-400">Base Unit Garment:</span>
                        <span className="font-mono text-slate-200">₹{item.unitBaseCost}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-400">Setup & Tooling Charge:</span>
                        <span className="font-mono text-amber-400">{item.setupFee > 0 ? `₹${item.setupFee}` : 'Included'}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-400">Sample Charge:</span>
                        <span className="font-mono text-slate-200">₹{item.sampleFee}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-400">Freight & Logistics:</span>
                        <span className="font-mono text-slate-200">{item.shippingFee > 0 ? `₹${item.shippingFee}` : 'Local pickup'}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-400">GST (12%):</span>
                        <span className="font-mono text-slate-200">₹{item.taxAmount?.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-400">Production Lead Time:</span>
                        <span className="font-semibold text-emerald-400">{item.leadTimeDays} business days</span>
                      </div>
                    </div>

                    {/* Inclusions & Exclusions */}
                    <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Inclusions:</span>
                        <ul className="mt-1 space-y-1">
                          {item.inclusions.map((inc, i) => (
                            <li key={i} className="flex items-start space-x-1.5 text-[11px] text-slate-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {item.exclusions?.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] uppercase font-bold text-amber-400">Exclusions:</span>
                          <ul className="mt-1 space-y-1">
                            {item.exclusions.map((exc, i) => (
                              <li key={i} className="flex items-start space-x-1.5 text-[11px] text-slate-400">
                                <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                                <span>{exc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => {
                          onRequestSample(item.quoteId);
                          onClose();
                        }}
                        className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30 transition-all text-center"
                      >
                        Order Sample (₹{item.sampleFee})
                      </button>
                      <button
                        onClick={() => {
                          onAcceptQuote(item.quoteId);
                          onClose();
                        }}
                        className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all text-center"
                      >
                        Accept & Lock Spec
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Matrix Table View (with sticky first column for easy side-scrolling on tablets and desktops) */}
        {viewMode === 'table' && (
          <div className="mt-4 overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-950/80">
                  <th className="py-3 px-3 sm:px-4 sticky left-0 bg-slate-950 z-10 w-44">Cost Item</th>
                  {comparison.map(item => (
                    <th key={item.quoteId} className="py-3 px-3 sm:px-4 text-center min-w-[150px]">
                      <div className="text-xs sm:text-sm font-bold text-white truncate">{item.manufacturerName}</div>
                      <div className="text-[10px] text-emerald-400 font-mono">#{item.quoteId.slice(0, 8)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {/* Landed Unit Cost */}
                <tr className="bg-emerald-500/10">
                  <td className="py-3 px-3 sm:px-4 font-bold text-white sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                    Landed Unit Cost
                  </td>
                  {comparison.map(item => (
                    <td key={item.quoteId} className="py-3 px-3 sm:px-4 text-center font-mono font-extrabold text-emerald-400 text-sm sm:text-base">
                      ₹{item.unitLandedCost}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-2.5 px-3 sm:px-4 text-slate-300 sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                    Base Piece Cost
                  </td>
                  {comparison.map(item => (
                    <td key={item.quoteId} className="py-2.5 px-3 sm:px-4 text-center font-mono text-slate-200">
                      ₹{item.unitBaseCost}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-2.5 px-3 sm:px-4 text-slate-300 sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                    Setup / Tooling
                  </td>
                  {comparison.map(item => (
                    <td key={item.quoteId} className="py-2.5 px-3 sm:px-4 text-center font-mono">
                      {item.setupFee > 0 ? <span className="text-amber-400">₹{item.setupFee}</span> : <span className="text-emerald-400">Included</span>}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-2.5 px-3 sm:px-4 text-slate-300 sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                    Sample Fee
                  </td>
                  {comparison.map(item => (
                    <td key={item.quoteId} className="py-2.5 px-3 sm:px-4 text-center font-mono text-slate-200">
                      ₹{item.sampleFee}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-2.5 px-3 sm:px-4 text-slate-300 sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                    Logistics / Freight
                  </td>
                  {comparison.map(item => (
                    <td key={item.quoteId} className="py-2.5 px-3 sm:px-4 text-center font-mono text-slate-200">
                      {item.shippingFee > 0 ? `₹${item.shippingFee}` : 'Local pickup'}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-2.5 px-3 sm:px-4 text-slate-300 sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                    Lead Time
                  </td>
                  {comparison.map(item => (
                    <td key={item.quoteId} className="py-2.5 px-3 sm:px-4 text-center font-semibold text-emerald-400">
                      {item.leadTimeDays} days
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-3 sm:px-4 sticky left-0 bg-slate-950 z-10 border-r border-slate-800 text-slate-400">
                    Action
                  </td>
                  {comparison.map(item => (
                    <td key={item.quoteId} className="py-3 px-3 sm:px-4 text-center">
                      <button
                        onClick={() => {
                          onAcceptQuote(item.quoteId);
                          onClose();
                        }}
                        className="py-1 px-2 sm:px-3 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow whitespace-nowrap"
                      >
                        Accept Quote
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
