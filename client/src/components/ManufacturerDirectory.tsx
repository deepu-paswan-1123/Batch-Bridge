import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Star, 
  Filter, 
  CheckCircle, 
  Plus, 
  X, 
  Sparkles, 
  HelpCircle, 
  Building2, 
  Layers, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { Manufacturer, VerificationCheck } from '../types';
import { api } from '../services/api';

interface ManufacturerDirectoryProps {
  manufacturers: Manufacturer[];
  onSelectManufacturer?: (mfg: Manufacturer) => void;
  onOpenMatchModal?: (mfg: Manufacturer) => void;
  onRefresh?: () => void;
}

const CHECK_LABELS: Record<string, { label: string; color: string }> = {
  identity_checked: { label: 'Identity Checked', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  capability_evidence: { label: 'Capability Audited', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  sample_reviewed: { label: 'Sample Tested', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  production_history: { label: 'Production History', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  inspection_recorded: { label: 'PSI Inspection Passed', color: 'bg-teal-500/10 text-teal-400 border-teal-500/30' }
};

const PRESET_CATEGORIES = ['apparel', 'textiles', 'packaging', 'leather', 'ceramics', 'accessories', 'metalware'];

export const ManufacturerDirectory: React.FC<ManufacturerDirectoryProps> = ({
  manufacturers,
  onSelectManufacturer,
  onRefresh
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCheckDetail, setSelectedCheckDetail] = useState<VerificationCheck | null>(null);

  // Registration Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [categoryChoice, setCategoryChoice] = useState<string>('apparel');
  const [customCategoryText, setCustomCategoryText] = useState('');
  
  // Custom Materials & Processes tags
  const [materials, setMaterials] = useState<string[]>(['Cotton', 'Bio-washed']);
  const [newMaterialInput, setNewMaterialInput] = useState('');
  const [capabilities, setCapabilities] = useState<string[]>(['Screen Printing']);
  const [newCapabilityInput, setNewCapabilityInput] = useState('');

  // Missing fields options
  const [offersSamples, setOffersSamples] = useState(true);
  const [sampleFee, setSampleFee] = useState<number>(500);
  const [samplePolicyNote, setSamplePolicyNote] = useState('');

  // MOQ & Capacity
  const [minMoq, setMinMoq] = useState<number>(300);
  const [maxMoq, setMaxMoq] = useState<number>(3000);
  const [minLeadDays, setMinLeadDays] = useState<number>(15);
  const [maxLeadDays, setMaxLeadDays] = useState<number>(30);
  const [city, setCity] = useState('Jaipur');
  const [state, setState] = useState('Rajasthan');
  const [cluster, setCluster] = useState('Sitapura Industrial Area');
  const [description, setDescription] = useState('');

  // Dynamically derive all categories present in the system
  const allCategories = Array.from(
    new Set([
      'all',
      'apparel',
      'textiles',
      'packaging',
      ...manufacturers.flatMap(m => m.categories || [])
    ])
  );

  const filtered = manufacturers.filter(m => {
    const matchesCat = selectedCategory === 'all' || m.categories.some(c => c.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch =
      m.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.categories?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.capabilities.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleAddMaterial = () => {
    if (newMaterialInput.trim() && !materials.includes(newMaterialInput.trim())) {
      setMaterials([...materials, newMaterialInput.trim()]);
      setNewMaterialInput('');
    }
  };

  const handleRemoveMaterial = (mat: string) => {
    setMaterials(materials.filter(m => m !== mat));
  };

  const handleAddCapability = () => {
    if (newCapabilityInput.trim() && !capabilities.includes(newCapabilityInput.trim())) {
      setCapabilities([...capabilities, newCapabilityInput.trim()]);
      setNewCapabilityInput('');
    }
  };

  const handleRemoveCapability = (cap: string) => {
    setCapabilities(capabilities.filter(c => c !== cap));
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const finalCategory = categoryChoice === 'other'
        ? (customCategoryText.trim().toLowerCase() || 'custom')
        : categoryChoice.toLowerCase();

      // Merge materials and processes into capabilities array for matching engine
      const combinedCapabilities = Array.from(new Set([...materials, ...capabilities]));

      await api.createManufacturer({
        businessName,
        categories: [finalCategory],
        capabilities: combinedCapabilities,
        moq: { min: Number(minMoq), max: Number(maxMoq) },
        leadTimeDays: { min: Number(minLeadDays), max: Number(maxLeadDays) },
        sampleFee: offersSamples ? Number(sampleFee) : 0,
        samplePolicy: offersSamples 
          ? (samplePolicyNote || `Physical pre-production sample provided (₹${sampleFee})`)
          : 'Digital CAD/Photo Proof Only (No physical sample)',
        location: { city, state, cluster },
        description: description || `Specialised in custom ${finalCategory} manufacturing with bespoke materials (${materials.join(', ')}).`
      });

      setIsRegisterOpen(false);
      // Reset form
      setBusinessName('');
      setCategoryChoice('apparel');
      setCustomCategoryText('');
      setDescription('');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-4 sm:p-8 border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2 sm:mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Evidence-Based Verification • Real Audit Trails</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
              Verified Small-Batch Manufacturers
            </h1>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Direct access to factories accepting <strong>500–5,000 unit production runs</strong> without 40% small-batch markups. Support for standard & custom materials, flexible sample policies, and verified audit badges.
            </p>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Register Company & Custom Material</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar (Dynamic categories that update automatically) */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between glass-panel p-3 sm:p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mr-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by city, material, capability..."
            className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Manufacturers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filtered.map(m => (
          <div key={m._id} className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                    <h3 className="font-bold text-base text-white hover:text-emerald-400 transition-colors">
                      {m.businessName}
                    </h3>
                    {m.categories?.map(c => (
                      <span key={c} className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-1.5 mt-1 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{m.location.cluster || `${m.location.city}, ${m.location.state}`}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold flex-shrink-0">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{m.rating || 4.8}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({m.totalCompletedOrders} runs)</span>
                </div>
              </div>

              {/* Description */}
              <p className="mt-2.5 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {m.description}
              </p>

              {/* Metrics Pills (Responsive formatting for sample policy) */}
              <div className="grid grid-cols-3 gap-2 mt-3.5 py-2 px-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
                <div>
                  <div className="text-[9px] sm:text-[10px] uppercase font-semibold text-slate-400">MOQ Range</div>
                  <div className="text-xs font-bold text-white mt-0.5">{m.moq.min.toLocaleString()} - {m.moq.max.toLocaleString()}</div>
                </div>
                <div className="border-x border-slate-800">
                  <div className="text-[9px] sm:text-[10px] uppercase font-semibold text-slate-400">Lead Time</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">{m.leadTimeDays.min}–{m.leadTimeDays.max} days</div>
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] uppercase font-semibold text-slate-400">Sample Policy</div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {m.sampleFee > 0 ? `₹${m.sampleFee}` : 'Digital / ₹0'}
                  </div>
                </div>
              </div>

              {/* Granular Evidence Badges */}
              <div className="mt-3.5">
                <div className="text-[10px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>Verified Checks</span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {m.verificationChecks?.length || 0} on file
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {m.verificationChecks && m.verificationChecks.length > 0 ? (
                    m.verificationChecks.map(check => {
                      const meta = CHECK_LABELS[check.checkType] || { label: check.title, color: 'bg-slate-800 text-slate-300 border-slate-700' };
                      return (
                        <button
                          key={check._id}
                          onClick={() => setSelectedCheckDetail(check)}
                          className={`text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all hover:scale-105 flex items-center space-x-1 cursor-pointer ${meta.color}`}
                        >
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>{meta.label}</span>
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">Self-declared onboarding</span>
                  )}
                </div>
              </div>

              {/* Materials & Capabilities */}
              <div className="mt-3 flex flex-wrap gap-1">
                {m.capabilities.slice(0, 4).map(cap => (
                  <span key={cap} className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50">
                    {cap}
                  </span>
                ))}
                {m.capabilities.length > 4 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded text-slate-400 font-medium">
                    +{m.capabilities.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] text-slate-400">
                Capacity: <strong>{m.capacityPerMonth?.toLocaleString()}</strong>/mo
              </span>

              {onSelectManufacturer && (
                <button
                  onClick={() => onSelectManufacturer(m)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30 transition-all"
                >
                  View Details & Quote
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Register Company & Custom Material Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Building2 className="w-5 h-5" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">Register Factory / Custom Material</h2>
                  <p className="text-xs text-slate-400">Define your custom product domain, bespoke materials, and sample terms.</p>
                </div>
              </div>
              <button onClick={() => setIsRegisterOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRegistration} className="mt-4 space-y-4">
              {/* Company Name */}
              <div>
                <label className="text-xs font-bold text-slate-300">Company / Factory Name *</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g., Sitapura Artisan Leather & Metal Works"
                  required
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category: Presets OR Custom Category */}
              <div>
                <label className="text-xs font-bold text-slate-300">Industry / Manufacturing Domain *</label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {[...PRESET_CATEGORIES, 'other'].map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategoryChoice(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                        categoryChoice === cat
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                          : 'bg-slate-850 text-slate-400 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {cat === 'other' ? '+ Other / Custom Category' : cat}
                    </button>
                  ))}
                </div>

                {/* What if they don't have existing category? Fill custom category field */}
                {categoryChoice === 'other' && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-emerald-500/30 animate-fade-in space-y-1">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Specify Your Product Domain:
                    </span>
                    <input
                      type="text"
                      value={customCategoryText}
                      onChange={e => setCustomCategoryText(e.target.value)}
                      placeholder="e.g. Leathercraft, Ceramics & Clay, Footwear, Wooden Decor, Eco-packaging..."
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <p className="text-[10px] text-slate-500">
                      This will automatically create a brand new category tab in the marketplace.
                    </p>
                  </div>
                )}
              </div>

              {/* Custom Materials Tag Builder */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Raw Materials Used in Your Unit</label>
                  <span className="text-[10px] text-slate-400">Type & press Add or Enter</span>
                </div>
                <div className="flex gap-2 mt-1.5">
                  <input
                    type="text"
                    value={newMaterialInput}
                    onChange={e => setNewMaterialInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMaterial();
                      }
                    }}
                    placeholder="e.g., Full Grain Leather, Terracotta Clay, Recycled Cork..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200"
                  >
                    Add
                  </button>
                </div>

                {/* Current Materials Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {materials.map(mat => (
                    <span
                      key={mat}
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs"
                    >
                      <span>{mat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(mat)}
                        className="hover:text-rose-400 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Custom Capabilities & Machinery */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Machinery & Manufacturing Capabilities</label>
                  <span className="text-[10px] text-slate-400">Type & press Add</span>
                </div>
                <div className="flex gap-2 mt-1.5">
                  <input
                    type="text"
                    value={newCapabilityInput}
                    onChange={e => setNewCapabilityInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCapability();
                      }
                    }}
                    placeholder="e.g., Laser Engraving, CNC Routing, Table Screen Print, Kiln Baking..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCapability}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {capabilities.map(cap => (
                    <span
                      key={cap}
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs"
                    >
                      <span>{cap}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCapability(cap)}
                        className="hover:text-rose-400 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* What if they don't offer samples? Flexible Sample Policy Section */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Pre-Production Sample Policy</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setOffersSamples(true)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                        offersSamples ? 'bg-purple-600 text-white font-bold' : 'text-slate-500 bg-slate-900'
                      }`}
                    >
                      Physical Sample
                    </button>
                    <button
                      type="button"
                      onClick={() => setOffersSamples(false)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                        !offersSamples ? 'bg-amber-600 text-white font-bold' : 'text-slate-500 bg-slate-900'
                      }`}
                    >
                      Digital 3D / No Sample
                    </button>
                  </div>
                </div>

                {offersSamples ? (
                  <div>
                    <label className="text-[11px] text-slate-400">Sample Charge (₹):</label>
                    <input
                      type="number"
                      value={sampleFee}
                      onChange={e => setSampleFee(Number(e.target.value) || 0)}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    Buyers will review high-resolution digital CAD / photo proofs. No physical swatch postage required.
                  </p>
                )}
              </div>

              {/* Practical MOQ & Lead Times */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Min Run (MOQ)</label>
                  <input
                    type="number"
                    value={minMoq}
                    onChange={e => setMinMoq(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Max Batch (Units)</label>
                  <input
                    type="number"
                    value={maxMoq}
                    onChange={e => setMaxMoq(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Min Lead (Days)</label>
                  <input
                    type="number"
                    value={minLeadDays}
                    onChange={e => setMinLeadDays(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Max Lead (Days)</label>
                  <input
                    type="number"
                    value={maxLeadDays}
                    onChange={e => setMaxLeadDays(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-400">City:</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">State:</label>
                  <input
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Industrial Area / Cluster:</label>
                  <input
                    type="text"
                    value={cluster}
                    onChange={e => setCluster(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-300">Unit Description / Craftsmanship Highlights</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Tell small brands what makes your batch production unique..."
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Publish Factory Listing</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Check Detail Modal */}
      {selectedCheckDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs uppercase font-bold tracking-wider">Verified Checkpoint</span>
              </div>
              <button
                onClick={() => setSelectedCheckDetail(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <h3 className="mt-3 text-lg font-bold text-white">
              {selectedCheckDetail.title}
            </h3>

            <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Evidence ID:</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedCheckDetail.evidenceRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Verified By:</span>
                <span className="text-slate-200">{selectedCheckDetail.checkedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-slate-200">{new Date(selectedCheckDetail.checkedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-300">Verification Scope & Notes:</div>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                {selectedCheckDetail.scope}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedCheckDetail(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
