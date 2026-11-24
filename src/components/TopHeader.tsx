import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  ChevronDown,
  Clock,
  LogOut,
  Search,
  Settings,
  User as UserIcon,
} from 'lucide-react';
import { NlaLogo } from './NlaLogo';
import { OverdueNotification, ParcelRecord } from '../types/lais';

interface TopHeaderProps {
  parcels: ParcelRecord[];
  notifications: OverdueNotification[];
  language: 'EN' | 'FR' | 'RW';
  onLanguageChange: (lang: 'EN' | 'FR' | 'RW') => void;
  onNavigateDashboard: () => void;
  onSelectParcel: (upi: string) => void;
  onOpenSearch: (query?: string) => void;
  onMarkAllRead: () => void;
  onMarkOneRead: (id: string) => void;
  onSignOut: () => void;
  onOpenPreferences: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  parcels,
  notifications,
  language,
  onLanguageChange,
  onNavigateDashboard,
  onSelectParcel,
  onOpenSearch,
  onMarkAllRead,
  onMarkOneRead,
  onSignOut,
  onOpenPreferences,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
        setNotifOpen(false);
        setLangOpen(false);
        setProfileOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
        setNotifOpen(false);
        setLangOpen(false);
        setProfileOpen(false);
      } else if (e.key === 'Escape' && searchFocused) {
        setSearchFocused(false);
        searchInputRef.current?.blur();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchFocused]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const trimmed = searchValue.trim().toLowerCase();
  const quickMatches = trimmed
    ? parcels
        .filter(
          (p) =>
            p.upi.toLowerCase().includes(trimmed) ||
            p.owner.toLowerCase().includes(trimmed) ||
            p.transactionId.toLowerCase().includes(trimmed)
        )
        .slice(0, 6)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickMatches.length === 1) {
      onSelectParcel(quickMatches[0].upi);
      setSearchFocused(false);
      return;
    }
    onOpenSearch(searchValue);
    setSearchFocused(false);
  };

  return (
    <header
      ref={headerRef}
      className="h-[64px] bg-white border-b border-slate-200/90 px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-40"
    >
      {/* Left Brand & Title */}
      <div className="flex items-center gap-3.5 shrink-0">
        <button
          type="button"
          onClick={onNavigateDashboard}
          className="cursor-pointer focus:outline-none text-left"
          title="Go to Dashboard"
        >
          <NlaLogo compact />
        </button>
        <div className="hidden sm:block h-7 w-[1px] bg-slate-200" />
        <button
          type="button"
          onClick={onNavigateDashboard}
          className="hidden md:block text-[17px] font-bold text-[#0F172A] tracking-tight hover:text-[#0298D8] transition cursor-pointer"
        >
          Land Administration Information System (LAIS)
        </button>
      </div>

      {/* Center Global Search */}
      <div className="relative flex-1 max-w-[440px]">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onFocus={() => setSearchFocused(true)}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setSearchFocused(true);
            }}
            placeholder="Search UPI, owner, or parcel ID..."
            className="w-full h-[38px] pl-10 pr-14 rounded-xl border border-slate-200 bg-[#F8FAFC] text-[13px] text-[#0F172A] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0298D8] focus:ring-2 focus:ring-[#0298D8]/15 transition"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border border-slate-200 bg-white text-[10px] font-semibold text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            ⌘K
          </kbd>
        </form>

        {/* Live Search Dropdown */}
        {searchFocused && (
          <div className="absolute left-0 right-0 top-[44px] bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50">
            {trimmed.length === 0 ? (
              <div className="p-2">
                <div className="px-2.5 py-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  Quick Access
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onOpenSearch('');
                    setSearchFocused(false);
                  }}
                  className="w-full px-3 py-2.5 rounded-lg flex items-center justify-between text-left hover:bg-[#EFF8FD] transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#EFF8FD] text-[#0298D8] flex items-center justify-center">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#0F172A]">
                        Open Registry Explorer
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Search by UPI, owner, application, or location
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#0298D8]">Open →</span>
                </button>
              </div>
            ) : quickMatches.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {quickMatches.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onSelectParcel(m.upi);
                      setSearchFocused(false);
                      setSearchValue('');
                    }}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-[#F2FAFE] transition cursor-pointer"
                  >
                    <div>
                      <div className="font-mono-code text-xs font-semibold text-[#0284C7]">
                        {m.upi}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {m.owner} · {m.district}, {m.sector}
                      </div>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {m.status}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    onOpenSearch(searchValue);
                    setSearchFocused(false);
                  }}
                  className="w-full px-3.5 py-2 text-xs font-semibold text-[#0298D8] bg-slate-50 hover:bg-slate-100 text-center cursor-pointer"
                >
                  Open in Registry Explorer →
                </button>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-xs text-slate-500">No instant parcel match for "{searchValue}"</p>
                <button
                  type="button"
                  onClick={() => {
                    onOpenSearch(searchValue);
                    setSearchFocused(false);
                  }}
                  className="mt-2 text-xs font-semibold text-[#0298D8] hover:underline cursor-pointer"
                >
                  Search in Registry Explorer →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Utilities: Bell, Language, User Profile */}
      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
        {/* Notifications Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((o) => !o);
              setLangOpen(false);
              setProfileOpen(false);
            }}
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-[340px] bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0F172A]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-700">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="text-[11px] font-semibold text-[#0298D8] hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      onMarkOneRead(n.id);
                      onSelectParcel(n.upi);
                      setNotifOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition flex items-start gap-3 cursor-pointer ${
                      n.unread ? 'bg-[#F8FCFF]' : ''
                    }`}
                  >
                    <div
                      className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        n.unread ? 'bg-[#0298D8]' : 'bg-slate-200'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono-code text-[11px] font-semibold text-[#0284C7]">
                          {n.upi}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600">
                          <Clock className="w-3 h-3" />
                          {n.daysOverdue}d overdue
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-0.5 leading-snug">{n.title}</p>
                      <span className="text-[10.5px] text-slate-400 mt-0.5 block">
                        {n.transactionRef} · {n.province}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Language Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setLangOpen((o) => !o);
              setNotifOpen(false);
              setProfileOpen(false);
            }}
            className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer"
          >
            {/* Compact Flag Badge */}
            {language === 'EN' && (
              <span className="w-4 h-3 rounded-[2px] overflow-hidden inline-flex items-center justify-center bg-[#012169] text-[7px] text-white font-bold border border-slate-200">
                <svg viewBox="0 0 24 16" className="w-full h-full">
                  <rect width="24" height="16" fill="#012169" />
                  <path d="M0 0L24 16M24 0L0 16" stroke="#FFF" strokeWidth="2.5" />
                  <path d="M0 0L24 16M24 0L0 16" stroke="#C8102E" strokeWidth="1.2" />
                  <path d="M12 0V16M0 8H24" stroke="#FFF" strokeWidth="4.2" />
                  <path d="M12 0V16M0 8H24" stroke="#C8102E" strokeWidth="2.4" />
                </svg>
              </span>
            )}
            {language === 'FR' && (
              <span className="w-4 h-3 rounded-[2px] overflow-hidden inline-flex border border-slate-200">
                <span className="w-1/3 h-full bg-[#0055A4]" />
                <span className="w-1/3 h-full bg-white" />
                <span className="w-1/3 h-full bg-[#EF4135]" />
              </span>
            )}
            {language === 'RW' && (
              <span className="w-4 h-3 rounded-[2px] overflow-hidden inline-flex flex-col border border-slate-200">
                <span className="h-1/2 w-full bg-[#00A1DE]" />
                <span className="h-1/4 w-full bg-[#FAD201]" />
                <span className="h-1/4 w-full bg-[#20603D]" />
              </span>
            )}
            <span>{language}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl border border-slate-200 shadow-lg p-1 z-50 text-xs">
              {(
                [
                  { code: 'EN', label: 'English' },
                  { code: 'FR', label: 'Français' },
                  { code: 'RW', label: 'Kinyarwanda' },
                ] as const
              ).map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    onLanguageChange(item.code);
                    setLangOpen(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between cursor-pointer ${
                    language === item.code
                      ? 'bg-[#EFF8FD] text-[#0284C7] font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] text-slate-400">{item.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((o) => !o);
              setNotifOpen(false);
              setLangOpen(false);
            }}
            className="flex items-center gap-2.5 pl-1 pr-1.5 py-1 rounded-xl hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="hidden sm:block text-right leading-tight">
              <div className="text-[12.5px] font-semibold text-[#0F172A]">
                Emmanuel Iraturinze
              </div>
              <div className="text-[11px] text-slate-400">Administrator</div>
            </div>
            <img
              src="/src/assets/images/male_admin_avatar_1795512642673.jpg"
              alt="Emmanuel Iraturinze"
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover object-top ring-1 ring-slate-200 shadow-sm shrink-0"
            />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <div className="font-semibold text-[#0F172A]">Emmanuel Iraturinze</div>
                <div className="text-[11px] text-slate-400">eiraturinze@gov.rw</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onOpenPreferences();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                Workspace Preferences
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onOpenPreferences();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                System Settings
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onSignOut();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition font-medium cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
