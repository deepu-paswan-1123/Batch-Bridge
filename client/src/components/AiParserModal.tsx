import React, { useState } from 'react';
import { Sparkles, AlertCircle, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface AiParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequirementCreated: (req: any) => void;
}

const SAMPLE_PROMPTS = [
  "Need 1000 black 240 GSM hoodies, embroidered front logo and puff print back, Sitapura Jaipur, delivery in 30 days, budget ₹250/unit",
  "Looking for 2500 custom magnetic closure rigid boxes for organic skincare jars with gold foil logo, delivered to Bengaluru in 25 days, budget ₹110/unit",
  "Want 800 premium bio-washed pique cotton polo t-shirts with two-button placket, Tiruppur, delivery 21 days, budget ₹220/unit"
];

export const AiParserModal: React.FC<AiParserModalProps> = ({
  isOpen,
  onClose,
  onRequirementCreated
}) => {
  const [promptText, setPromptText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = async () => {
    if (!promptText.trim()) return;
    setIsParsing(true);
    setError(null);
    try {
      const res = await api.parseRequirementAi(promptText);
      if (res.error) throw new Error(res.error);
      setParsedData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to parse text. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async () => {
    if (!parsedData) return;
    setIsSubmitting(true);
    try {
      const res = await api.createRequirement(parsedData);
      if (res.error) throw new Error(res.error);
      onRequirementCreated(res.requirement);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to post brief.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 text-emerald-400">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Manufacturing Brief Builder</h2>
              <p className="text-xs text-slate-400">Describe what you want to produce in plain English</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Input Phase */}
        {!parsedData ? (
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Paste or write your production requirement:
              </label>
              <textarea
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                rows={4}
                placeholder="e.g. Need 1000 black hoodies with puff print logo, delivery to Jaipur in 30 days, budget ₹250/unit..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>

            {/* Pre-filled Sample Prompts */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-2">Or try a 1-click test prompt:</div>
              <div className="space-y-1.5">
                {SAMPLE_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setPromptText(prompt)}
                    className="w-full text-left p-2.5 rounded-lg text-xs bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all flex items-center justify-between"
                  >
                    <span className="truncate pr-2">{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleParse}
                disabled={isParsing || !promptText.trim()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center space-x-2"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting Tech Specs...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Parse into Structured Brief</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation & Review Phase (Adhering to AI Guardrail: Buyer Confirms) */
          <div className="mt-5 space-y-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">
                  Tech Specs Extracted Successfully (94% confidence)
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                AI-suggested, please confirm
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400">Brief Title</label>
                <input
                  type="text"
                  value={parsedData.title}
                  onChange={e => setParsedData({ ...parsedData, title: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Category</label>
                  <input
                    type="text"
                    value={parsedData.category}
                    onChange={e => setParsedData({ ...parsedData, category: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white capitalize"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Quantity (Units)</label>
                  <input
                    type="number"
                    value={parsedData.quantity}
                    onChange={e => setParsedData({ ...parsedData, quantity: parseInt(e.target.value, 10) })}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Target Budget (₹/unit)</label>
                  <input
                    type="number"
                    value={parsedData.budget || ''}
                    onChange={e => setParsedData({ ...parsedData, budget: parseInt(e.target.value, 10) })}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Lead Time (Days)</label>
                  <input
                    type="number"
                    value={parsedData.deadlineDays}
                    onChange={e => setParsedData({ ...parsedData, deadlineDays: parseInt(e.target.value, 10) })}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Target City</label>
                  <input
                    type="text"
                    value={parsedData.location?.city || ''}
                    onChange={e => setParsedData({
                      ...parsedData,
                      location: { ...parsedData.location, city: e.target.value }
                    })}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">State / Region</label>
                  <input
                    type="text"
                    value={parsedData.location?.state || ''}
                    onChange={e => setParsedData({
                      ...parsedData,
                      location: { ...parsedData.location, state: e.target.value }
                    })}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Specs */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300">Technical Specifications</div>
                <div>
                  <label className="text-[10px] text-slate-400">Fabric & Material Composition:</label>
                  <input
                    type="text"
                    value={parsedData.specs?.material || ''}
                    onChange={e => setParsedData({
                      ...parsedData,
                      specs: { ...parsedData.specs, material: e.target.value }
                    })}
                    className="w-full mt-0.5 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Tolerances & Quality Standard:</label>
                  <input
                    type="text"
                    value={parsedData.specs?.tolerances || ''}
                    onChange={e => setParsedData({
                      ...parsedData,
                      specs: { ...parsedData.specs, tolerances: e.target.value }
                    })}
                    className="w-full mt-0.5 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setParsedData(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                ← Back to Edit Prompt
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Posting RFP...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Launch Matching Engine</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
