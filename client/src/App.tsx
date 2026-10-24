import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ManufacturerDirectory } from './components/ManufacturerDirectory';
import { RequirementsView } from './components/RequirementsView';
import { AiParserModal } from './components/AiParserModal';
import { MatchExplainerModal } from './components/MatchExplainerModal';
import { QuoteComparisonModal } from './components/QuoteComparisonModal';
import { SampleLabView } from './components/SampleLabView';
import { OrderMilestonesView } from './components/OrderMilestonesView';
import { AdminVerificationQueue } from './components/AdminVerificationQueue';
import { SubmitQuoteModal } from './components/SubmitQuoteModal';
import { Manufacturer, Requirement, Quote, Sample, Order, MatchResult, User, Role } from './types';
import { api } from './services/api';
import { ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('directory');
  const [currentUser, setCurrentUser] = useState<User>({
    _id: 'user_buyer_01',
    name: 'Aarav Singhania',
    email: 'aarav@urbanthread.in',
    role: 'buyer'
  });
  const [demoUsers, setDemoUsers] = useState<User[]>([]);

  // Domain data
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Modals & Active Selections
  const [isAiBriefOpen, setIsAiBriefOpen] = useState(false);
  const [activeMatch, setActiveMatch] = useState<MatchResult | null>(null);
  const [activeQuoteComparison, setActiveQuoteComparison] = useState<{
    quotes: Quote[];
    comparison: any[];
    narrative: string;
  } | null>(null);
  const [quotingRequirement, setQuotingRequirement] = useState<Requirement | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAll = async () => {
    try {
      const [uRes, mRes, rRes, sRes, oRes] = await Promise.all([
        api.getDemoUsers(),
        api.getManufacturers(),
        api.getRequirements(),
        api.getSamples(),
        api.getOrders()
      ]);

      if (uRes.users) setDemoUsers(uRes.users);
      if (mRes.manufacturers) setManufacturers(mRes.manufacturers);
      if (rRes.requirements) setRequirements(rRes.requirements);
      if (sRes.samples) setSamples(sRes.samples);
      if (oRes.orders) setOrders(oRes.orders);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    localStorage.setItem('activeUserId', currentUser._id);
    loadAll();
  }, [currentUser._id]);

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('activeUserId', user._id);
    showToast(`Switched active persona to ${user.name} (${user.role.toUpperCase()})`);
  };

  const handleRequirementCreated = async (req: Requirement) => {
    showToast(`Requirement "${req.title}" created. Matching engine started.`);
    await loadAll();
    setActiveTab('requirements');

    // Automatically run matching engine and show explainer
    try {
      const matchRes = await api.matchManufacturersAi(req, req._id);
      if (matchRes.matches && matchRes.matches.length > 0) {
        setActiveMatch(matchRes.matches[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewMatches = (matches: MatchResult[], req: Requirement) => {
    if (matches && matches.length > 0) {
      setActiveMatch(matches[0]);
    }
  };

  const handleCompareQuotes = async (req: Requirement) => {
    try {
      const res = await api.compareQuotesAi(req._id);
      setActiveQuoteComparison({
        quotes: res.quotes || [],
        comparison: res.comparison || [],
        narrative: res.narrative || ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      await api.createOrder({ quoteId });
      showToast('Quote accepted! Order confirmed with milestone tracking.');
      await loadAll();
      setActiveTab('orders');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestSample = async (quoteId: string) => {
    try {
      await api.requestSample({ quoteId });
      showToast('Sample requested from factory. Proceed to Sample Lab to review.');
      await loadAll();
      setActiveTab('samples');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdvanceToOrder = async (sample: Sample) => {
    try {
      await api.createOrder({ quoteId: sample.quoteId });
      showToast('Spec locked! Order advanced to bulk production milestones.');
      await loadAll();
      setActiveTab('orders');
    } catch (err) {
      console.error(err);
    }
  };

  const handleInviteManufacturer = async (manufacturerId: string) => {
    showToast('Factory invited to submit itemised quote.');
    await loadAll();
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 glass-panel border border-emerald-500/40 bg-slate-950/95 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        demoUsers={demoUsers}
        onSwitchUser={handleSwitchUser}
        onOpenAiBrief={() => setIsAiBriefOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-24 md:pb-12">
        {/* Persona Context Banner */}
        <div className="mb-4 sm:mb-6 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-1.5 text-[11px] sm:text-xs text-slate-400">
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-slate-500">Active:</span>
            <span className="text-slate-200 font-medium">{currentUser.name}</span>
            <span className="text-slate-600 hidden xs:inline">•</span>
            <span className="text-emerald-400 uppercase font-bold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">{currentUser.role}</span>
          </div>
          <div className="hidden sm:block text-[11px] text-slate-500">
            Switch between Buyer, Manufacturer, or Admin from top-right.
          </div>
        </div>

        {/* Tab Switching */}
        {activeTab === 'directory' && (
          <ManufacturerDirectory
            manufacturers={manufacturers}
            onRefresh={loadAll}
            onSelectManufacturer={(m) => {
              if (requirements[0]) {
                handleCompareQuotes(requirements[0]);
              } else {
                setIsAiBriefOpen(true);
              }
            }}
          />
        )}

        {activeTab === 'requirements' && (
          <RequirementsView
            requirements={requirements}
            userRole={currentUser.role}
            onOpenNewBrief={() => setIsAiBriefOpen(true)}
            onViewMatches={handleViewMatches}
            onCompareQuotes={handleCompareQuotes}
            onSubmitQuote={(req) => setQuotingRequirement(req)}
          />
        )}

        {activeTab === 'quotes' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Itemised Quotation Matrix</h1>
              <p className="text-xs text-slate-400 mt-1">
                Select any active requirement to inspect landed unit costs, exclusions, and side-by-side breakdowns.
              </p>
            </div>
            {requirements.map(req => (
              <div key={req._id} className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{req.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{req.quantity} units • Target Budget: ₹{req.budget}/unit</p>
                </div>
                <button
                  onClick={() => handleCompareQuotes(req)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow"
                >
                  Open Side-by-Side Matrix
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'samples' && (
          <SampleLabView
            samples={samples}
            userRole={currentUser.role}
            onRefresh={loadAll}
            onAdvanceToOrder={handleAdvanceToOrder}
          />
        )}

        {activeTab === 'orders' && (
          <OrderMilestonesView
            orders={orders}
            userRole={currentUser.role}
            onRefresh={loadAll}
          />
        )}

        {activeTab === 'admin' && (
          <AdminVerificationQueue
            manufacturers={manufacturers}
            onRefresh={loadAll}
          />
        )}
      </main>

      {/* Global Modals */}
      <AiParserModal
        isOpen={isAiBriefOpen}
        onClose={() => setIsAiBriefOpen(false)}
        onRequirementCreated={handleRequirementCreated}
      />

      <MatchExplainerModal
        match={activeMatch}
        onClose={() => setActiveMatch(null)}
        onInvite={handleInviteManufacturer}
      />

      {activeQuoteComparison && (
        <QuoteComparisonModal
          isOpen={true}
          onClose={() => setActiveQuoteComparison(null)}
          quotes={activeQuoteComparison.quotes}
          comparison={activeQuoteComparison.comparison}
          aiNarrative={activeQuoteComparison.narrative}
          onAcceptQuote={handleAcceptQuote}
          onRequestSample={handleRequestSample}
        />
      )}

      <SubmitQuoteModal
        isOpen={!!quotingRequirement}
        onClose={() => setQuotingRequirement(null)}
        requirement={quotingRequirement}
        onQuoteSubmitted={loadAll}
      />
    </div>
  );
}

export default App;
