import React, { useState } from 'react';
import { 
  Factory, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  BarChart3, 
  Package, 
  Activity, 
  ChevronDown, 
  Menu, 
  X 
} from 'lucide-react';
import { Role } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: { _id: string; name: string; email: string; role: Role };
  demoUsers: Array<{ _id: string; name: string; email: string; role: Role }>;
  onSwitchUser: (user: any) => void;
  onOpenAiBrief: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  demoUsers,
  onSwitchUser,
  onOpenAiBrief
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);

  const navItems = [
    { id: 'directory', label: 'Factories', icon: Factory },
    { id: 'requirements', label: 'RFPs & Briefs', icon: FileText },
    { id: 'quotes', label: 'Quote Matrix', icon: BarChart3 },
    { id: 'samples', label: 'Sample Lab', icon: Package },
    { id: 'orders', label: 'Milestones', icon: Activity },
    { id: 'admin', label: 'Trust & Admin', icon: ShieldCheck, highlight: true }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-950/95 backdrop-blur-md max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-2">
            
            {/* Logo (Shrink-safe down to 300px) */}
            <div 
              className="flex items-center space-x-1.5 sm:space-x-2.5 cursor-pointer min-w-0 flex-shrink" 
              onClick={() => handleTabClick('directory')}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 flex-shrink-0">
                <Factory className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 font-bold" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-sm sm:text-base lg:text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-emerald-400 truncate">
                    BatchBridge<span className="text-emerald-400">.AI</span>
                  </span>
                  <span className="hidden sm:inline-flex text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                    500–5K
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden xl:block leading-none mt-0.5">Small-Batch Manufacturing</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                      isActive
                        ? item.highlight
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Action buttons (Ultra-compact on 320px) */}
            <div className="flex items-center space-x-1.5 sm:space-x-2.5 flex-shrink-0">
              {/* AI Brief Button (Icon only on <380px) */}
              <button
                onClick={onOpenAiBrief}
                title="Create AI Brief"
                className="inline-flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline ml-1.5">AI Brief</span>
              </button>

              {/* Persona Switcher Dropdown (Responsive touch toggle) */}
              <div className="relative">
                <button 
                  onClick={() => setIsPersonaOpen(!isPersonaOpen)}
                  title={`Active persona: ${currentUser.name}`}
                  className="flex items-center space-x-1 sm:space-x-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 active:bg-slate-800 text-xs transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
                  <span className="text-slate-300 font-medium truncate max-w-[55px] sm:max-w-[90px] hidden xs:inline">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400 hidden xs:inline flex-shrink-0" />
                </button>

                {/* Dropdown Menu with Backdrop */}
                {isPersonaOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
                      onClick={() => setIsPersonaOpen(false)}
                    />
                    <div className="absolute right-0 mt-1.5 w-60 sm:w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl backdrop-blur-2xl p-2 z-50 animate-fade-in">
                      <div className="text-[11px] font-bold text-slate-400 px-2 py-1.5 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 mb-1">
                        <span>Select Role (Demo)</span>
                        <span className="text-[10px] text-emerald-400 font-normal">Switch</span>
                      </div>
                      <div className="space-y-1">
                        {demoUsers.map(u => (
                          <button
                            key={u._id}
                            onClick={() => {
                              onSwitchUser(u);
                              setIsPersonaOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                              currentUser._id === u._id ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <div className="font-semibold text-slate-200">{u.name}</div>
                              <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                            </div>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase flex-shrink-0 ${
                              u.role === 'admin' ? 'bg-amber-500/20 text-amber-300' :
                              u.role === 'manufacturer' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {u.role}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Hamburger Button for Mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Slide-Down Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-950/98 px-3 pt-2.5 pb-4 space-y-2 animate-fade-in shadow-2xl">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pb-1">
              Navigation Menu
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full p-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                      isActive
                        ? item.highlight
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Modern Mobile Bottom Navigation Bar (< 768px) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 md:hidden flex justify-around items-center py-1.5 px-1 shadow-2xl max-w-full">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-all min-w-0 ${
                isActive
                  ? 'text-emerald-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-md ${isActive ? 'bg-emerald-500/15' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] tracking-tight mt-0.5 truncate max-w-[48px]">
                {item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
