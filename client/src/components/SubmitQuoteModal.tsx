import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, X, DollarSign, Loader2 } from 'lucide-react';
import { Requirement, QuoteLineItem } from '../types';
import { api } from '../services/api';

interface SubmitQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: Requirement | null;
  onQuoteSubmitted: () => void;
}

export const SubmitQuoteModal: React.FC<SubmitQuoteModalProps> = ({
  isOpen,
  onClose,
  requirement,
  onQuoteSubmitted
}) => {
  if (!isOpen || !requirement) return null;

  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([
    { description: 'Raw Material & Fabric Cutting', unitCost: 105 },
    { description: 'Tailoring & Construction', unitCost: 35 },
    { description: 'Custom Printing / Branding', unitCost: 25 },
    { description: 'Softener Wash & Quality Inspection', unitCost: 10 }
  ]);
  const [setupFee, setSetupFee] = useState<number>(3000);
  const [sampleFee, setSampleFee] = useState<number>(650);
  const [shippingFee, setShippingFee] = useState<number>(2500);
  const [taxRatePercent, setTaxRatePercent] = useState<number>(12);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(24);
  const [inclusionsText, setInclusionsText] = useState('Standard polybag packaging, Fabric pre-shrink wash, Local delivery');
  const [exclusionsText, setExclusionsText] = useState('Vector artwork files to be provided by client, Custom woven neck tags');
  const [terms, setTerms] = useState('50% advance upon sample approval, 50% prior to dispatch post inspection');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const qty = requirement.quantity || 1000;
  const baseCost = lineItems.reduce((acc, item) => acc + (Number(item.unitCost) || 0), 0);
  const totalBase = baseCost * qty;
  const totalSub = totalBase + setupFee + shippingFee;
  const tax = (totalSub * taxRatePercent) / 100;
  const totalLanded = totalSub + tax;
  const unitLanded = Number((totalLanded / qty).toFixed(2));

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: 'New operation / charge', unitCost: 0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleUpdateLineItem = (index: number, field: string, value: any) => {
    const updated = [...lineItems];
    (updated[index] as any)[field] = value;
    setLineItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.submitQuote(requirement._id, {
        lineItems,
        setupFee,
        sampleFee,
        shippingFee,
        taxRatePercent,
        leadTimeDays,
        terms,
        inclusions: inclusionsText.split(',').map(s => s.trim()).filter(Boolean),
        exclusions: exclusionsText.split(',').map(s => s.trim()).filter(Boolean)
      });
      onQuoteSubmitted();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">Submit Itemised Quotation</h2>
            <p className="text-xs text-slate-400">
              For: <strong className="text-slate-200">{requirement.title}</strong> ({qty.toLocaleString()} units)
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Itemised Cost Breakdown (per unit)
              </label>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Line Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {lineItems.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => handleUpdateLineItem(idx, 'description', e.target.value)}
                    placeholder="Description..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1.5 text-xs text-slate-500">₹</span>
                    <input
                      type="number"
                      value={item.unitCost}
                      onChange={e => handleUpdateLineItem(idx, 'unitCost', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-6 pr-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Ancillary Charges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Setup / Mould (₹)</label>
              <input
                type="number"
                value={setupFee}
                onChange={e => setSetupFee(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Sample Fee (₹)</label>
              <input
                type="number"
                value={sampleFee}
                onChange={e => setSampleFee(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Freight Charge (₹)</label>
              <input
                type="number"
                value={shippingFee}
                onChange={e => setShippingFee(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Lead Time (Days)</label>
              <input
                type="number"
                value={leadTimeDays}
                onChange={e => setLeadTimeDays(parseInt(e.target.value, 10) || 20)}
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Inclusions (comma separated):</label>
              <textarea
                value={inclusionsText}
                onChange={e => setInclusionsText(e.target.value)}
                rows={2}
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Exclusions (comma separated):</label>
              <textarea
                value={exclusionsText}
                onChange={e => setExclusionsText(e.target.value)}
                rows={2}
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Landed Summary Callout */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Calculated Landed Unit Cost:</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">₹{unitLanded} / unit</div>
            </div>
            <div className="text-right text-xs text-slate-400">
              <div>Total Landed Order: <strong className="text-white font-mono">₹{totalLanded.toLocaleString()}</strong></div>
              <div>Incl. {taxRatePercent}% GST (₹{tax.toFixed(0)})</div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center space-x-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Submit Official Quote</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
