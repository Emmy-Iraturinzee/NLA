import React, { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { BookTransactionView } from './components/BookTransactionView';
import { DashboardView } from './components/DashboardView';
import { LandParcelSearchView } from './components/LandParcelSearchView';
import { LeftNavRail } from './components/LeftNavRail';
import { LoginView } from './components/LoginView';
import { NlaLoader } from './components/NlaLoader';
import { ParcelWorkspaceView } from './components/ParcelWorkspaceView';
import { TopHeader } from './components/TopHeader';
import { WelcomeView } from './components/WelcomeView';
import { INITIAL_NOTIFICATIONS, INITIAL_PARCELS } from './data/mockLaisData';
import {
  AppScreen,
  IntegrationSource,
  KpiStatusKey,
  OverdueNotification,
  ParcelRecord,
} from './types/lais';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('welcome');
  const [previousScreen, setPreviousScreen] = useState<AppScreen>('dashboard');
  const [parcels, setParcels] = useState<ParcelRecord[]>(INITIAL_PARCELS);
  const [activeUpi, setActiveUpi] = useState<string>('1/02/12/08/3356');
  const [bookInitialUpi, setBookInitialUpi] = useState<string | null>(null);
  const [selectedKpi, setSelectedKpi] = useState<KpiStatusKey | null>(null);
  const [sourceFilter, setSourceFilter] = useState<'All Sources' | IntegrationSource>('All Sources');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notifications, setNotifications] =
    useState<OverdueNotification[]>(INITIAL_NOTIFICATIONS);
  const [showActionBanner, setShowActionBanner] = useState<boolean>(false);
  const [actionBannerDismissed, setActionBannerDismissed] = useState<boolean>(false);
  const [language, setLanguage] = useState<'EN' | 'FR' | 'RW'>('EN');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [isEnteringDashboard, setIsEnteringDashboard] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (!isEnteringDashboard) return;
    const timer = window.setTimeout(() => {
      setIsEnteringDashboard(false);
      setScreen('dashboard');
    }, 1550);
    return () => window.clearTimeout(timer);
  }, [isEnteringDashboard]);

  useEffect(() => {
    if (screen === 'dashboard' && !actionBannerDismissed && !showActionBanner) {
      const timer = window.setTimeout(() => {
        setShowActionBanner(true);
      }, 3000);
      return () => window.clearTimeout(timer);
    }
  }, [screen, actionBannerDismissed, showActionBanner]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  const navigateTo = (next: AppScreen) => {
    if (next !== screen) {
      setPreviousScreen(screen);
      setScreen(next);
    }
  };

  const handleOpenParcel = (upi: string) => {
    setActiveUpi(upi);
    navigateTo('parcel');
  };

  const handleOpenSearch = (query = '') => {
    setSearchQuery(query);
    navigateTo('search');
  };

  const handleBookParcel = (upi: string) => {
    setBookInitialUpi(upi);
    navigateTo('book');
  };

  const handleUpdateParcel = (
    upi: string,
    updater: (prev: ParcelRecord) => ParcelRecord
  ) => {
    setParcels((prevList) =>
      prevList.map((p) => (p.upi === upi ? updater(p) : p))
    );
  };

  return (
    <AnimatePresence mode="wait">
      {isEnteringDashboard ? (
        <motion.div
          key="screen-nla-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-screen"
        >
          <NlaLoader />
        </motion.div>
      ) : screen === 'welcome' ? (
        <motion.div
          key="screen-welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-screen"
        >
          <WelcomeView onGoToLogin={() => setScreen('login')} />
        </motion.div>
      ) : screen === 'login' ? (
        <motion.div
          key="screen-login"
          initial={{ opacity: 0, scale: 0.992 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.995 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-screen"
        >
          <LoginView
            onBackToWelcome={() => setScreen('welcome')}
            onLoginSuccess={() => {
              setShowActionBanner(false);
              setActionBannerDismissed(false);
              setIsEnteringDashboard(true);
            }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="screen-app-shell"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-screen h-screen flex flex-col bg-[#F4F7FA] text-[#0F172A] overflow-hidden"
        >
          {/* Persistent Top Header */}
          <TopHeader
            parcels={parcels}
            notifications={notifications}
            language={language}
            onLanguageChange={(lang) => {
              setLanguage(lang);
              showToast(`Display language switched to ${lang}`);
            }}
            onNavigateDashboard={() => navigateTo('dashboard')}
            onSelectParcel={handleOpenParcel}
            onOpenSearch={handleOpenSearch}
            onMarkAllRead={() => {
              setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
              showToast('All notifications marked as read');
            }}
            onMarkOneRead={(id) =>
              setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
              )
            }
            onSignOut={() => {
              setScreen('login');
              setSelectedKpi(null);
              setSourceFilter('All Sources');
              setShowActionBanner(false);
              setActionBannerDismissed(false);
            }}
            onOpenPreferences={() => setPrefsOpen(true)}
          />

          {/* Main App Body with Persistent Sidebar & Smooth Page Transitions */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <LeftNavRail
              activeScreen={screen}
              theme={theme}
              onThemeChange={(nextTheme) => setTheme(nextTheme)}
              onNavigate={(target) => {
                if (target === 'search') {
                  handleOpenSearch('');
                } else if (target === 'book') {
                  setBookInitialUpi(null);
                  navigateTo('book');
                } else if (target === 'dashboard') {
                  setSelectedKpi(null);
                  setSourceFilter('All Sources');
                  navigateTo('dashboard');
                } else {
                  navigateTo(target);
                }
              }}
              onSignOut={() => {
                setScreen('login');
                setSelectedKpi(null);
                setSourceFilter('All Sources');
                setShowActionBanner(false);
                setActionBannerDismissed(false);
              }}
            />

            <AnimatePresence mode="wait">
              {screen === 'dashboard' && (
                <motion.div
                  key="page-dashboard"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 flex min-w-0 min-h-0 overflow-hidden"
                >
                  <DashboardView
                    parcels={parcels}
                    selectedKpi={selectedKpi}
                    onSelectKpi={setSelectedKpi}
                    sourceFilter={sourceFilter}
                    onSourceFilterChange={setSourceFilter}
                    onOpenParcel={handleOpenParcel}
                    showActionBanner={showActionBanner}
                    onDismissActionBanner={() => {
                      setShowActionBanner(false);
                      setActionBannerDismissed(true);
                    }}
                  />
                </motion.div>
              )}

              {screen === 'search' && (
                <motion.div
                  key="page-search"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 flex min-w-0 min-h-0 overflow-hidden"
                >
                  <LandParcelSearchView
                    parcels={parcels}
                    initialQuery={searchQuery}
                    onBack={() =>
                      navigateTo(previousScreen === 'search' ? 'dashboard' : previousScreen)
                    }
                    onSelectParcel={handleOpenParcel}
                    onBookParcel={handleBookParcel}
                  />
                </motion.div>
              )}

              {screen === 'book' && (
                <motion.div
                  key="page-book"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 flex min-w-0 min-h-0 overflow-hidden"
                >
                  <BookTransactionView
                    key={bookInitialUpi ?? 'book-empty'}
                    parcels={parcels}
                    initialUpi={bookInitialUpi}
                    onBack={() =>
                      navigateTo(previousScreen === 'book' ? 'dashboard' : previousScreen)
                    }
                    onOpenParcel={handleOpenParcel}
                    onBookSuccess={(payload) => {
                      const upiSet = new Set(payload.upis.map((u) => u.toLowerCase()));
                      setParcels((prevList) =>
                        prevList.map((p) => {
                          if (!upiSet.has(p.upi.toLowerCase())) return p;
                          return {
                            ...p,
                            status: 'Booked',
                            transactionId: payload.reference,
                            source: payload.source,
                            transactions: [
                              {
                                id: `tx-${Date.now()}-${p.id}`,
                                dateLabel: payload.dateReceived,
                                reference: payload.reference,
                                type: payload.transactionType,
                                category: 'Transactions',
                                status: 'Booked',
                                source: payload.source,
                                province: p.province,
                                applicant: payload.applicantName,
                              },
                              ...p.transactions,
                            ],
                            history: [
                              {
                                id: `hist-${Date.now()}-${p.id}`,
                                status: 'BOOKED',
                                user: 'Emmanuel Iraturinze',
                                startTimestamp: `${payload.dateReceived} 09:00`,
                              },
                              ...p.history,
                            ],
                          };
                        })
                      );
                      showToast(
                        `Transaction ${payload.reference} booked (${payload.upis.length} UPI${
                          payload.upis.length > 1 ? 's' : ''
                        })`
                      );
                    }}
                  />
                </motion.div>
              )}

              {screen === 'parcel' && (
                <motion.div
                  key="page-parcel"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 flex min-w-0 min-h-0 overflow-hidden"
                >
                  <ParcelWorkspaceView
                    parcels={parcels}
                    activeUpi={activeUpi}
                    onSelectUpi={handleOpenParcel}
                    onBackToDashboard={() => navigateTo('dashboard')}
                    onOpenSearch={() => handleOpenSearch('')}
                    onUpdateParcel={handleUpdateParcel}
                    onShowToast={showToast}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Workspace Preferences Modal */}
          <AnimatePresence>
            {prefsOpen && (
              <motion.div
                key="prefs-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-[400px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0F172A]">Workspace Preferences</h3>
                    <button
                      type="button"
                      onClick={() => setPrefsOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-6 space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[#0F172A]">Default Registry Province</div>
                        <div className="text-slate-400 mt-0.5">Filter transactions on parcel open</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-[#EFF8FD] text-[#0284C7] font-semibold">
                        Kigali City
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[#0F172A]">GIS Coordinate Reference</div>
                        <div className="text-slate-400 mt-0.5">ITRF2005 / Rwanda TM</div>
                      </div>
                      <span className="font-mono-code px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                        EPSG:4326
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[#0F172A]">Interface Language</div>
                        <div className="text-slate-400 mt-0.5">Current active locale</div>
                      </div>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'EN' | 'FR' | 'RW')}
                        className="h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-[#0F172A]"
                      >
                        <option value="EN">English (EN)</option>
                        <option value="FR">Français (FR)</option>
                        <option value="RW">Kinyarwanda (RW)</option>
                      </select>
                    </div>
                  </div>
                  <div className="px-6 py-3.5 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setPrefsOpen(false)}
                      className="px-4 py-2 rounded-xl bg-[#0298D8] hover:bg-[#0284C7] text-white text-xs font-semibold cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Feedback Toast */}
          <AnimatePresence>
            {toastMsg && (
              <motion.div
                key="feedback-toast"
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className={`fixed right-5 z-[60] bg-[#0F172A] text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-[top] duration-200 ${
                  screen === 'dashboard' && showActionBanner ? 'top-[228px]' : 'top-[76px]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
                <span>{toastMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
