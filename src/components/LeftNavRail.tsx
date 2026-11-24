import React, { useState } from 'react';
import {
  BookPlus,
  LayoutGrid,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sun,
} from 'lucide-react';
import { AppScreen } from '../types/lais';

interface LeftNavRailProps {
  activeScreen: AppScreen;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onNavigate: (screen: AppScreen) => void;
  onSignOut: () => void;
}

export const LeftNavRail: React.FC<LeftNavRailProps> = ({
  activeScreen,
  theme,
  onThemeChange,
  onNavigate,
  onSignOut,
}) => {
  const [expanded, setExpanded] = useState(false);

  const primaryItems: Array<{
    id: AppScreen;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutGrid className="w-[18px] h-[18px]" />,
    },
    {
      id: 'search',
      label: 'Parcel Search',
      icon: <Search className="w-[18px] h-[18px]" />,
    },
    {
      id: 'book',
      label: 'Book Transaction',
      icon: <BookPlus className="w-[18px] h-[18px]" />,
    },
  ];

  const isDark = theme === 'dark';

  return (
    <aside
      className={`relative z-30 bg-white border-r border-slate-200/90 flex flex-col justify-between py-3 transition-all duration-200 shrink-0 ${
        expanded ? 'w-[228px] px-3' : 'w-[60px] items-center'
      }`}
    >
      {/* Top Section */}
      <div className="flex flex-col gap-1 w-full">
        {/* Collapse / Expand Header */}
        <div
          className={`flex items-center mb-1 ${
            expanded ? 'justify-between px-1.5' : 'justify-center'
          }`}
        >
          {expanded && (
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
              NLA Workspace
            </span>
          )}
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="group relative h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
            aria-label={expanded ? 'Collapse navigation' : 'Expand navigation'}
          >
            {expanded ? (
              <PanelLeftClose className="w-[17px] h-[17px]" />
            ) : (
              <PanelLeftOpen className="w-[17px] h-[17px]" />
            )}
            {!expanded && (
              <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-full ml-2.5 px-2.5 py-1 rounded-lg bg-[#0F172A] text-white text-[11px] font-semibold whitespace-nowrap shadow-lg z-50 border border-slate-700/60">
                Expand menu
              </span>
            )}
          </button>
        </div>

        {/* Section Label: Operations */}
        {expanded ? (
          <div className="px-2 pt-1 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-400">
            Operations
          </div>
        ) : (
          <div className="mx-3 my-1 border-t border-slate-100" />
        )}

        {/* Primary Nav Items (Clean, no numeric badges) */}
        <div className={`flex flex-col gap-1 ${expanded ? '' : 'items-center'}`}>
          {primaryItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`group relative h-9 rounded-xl flex items-center transition cursor-pointer ${
                  expanded ? 'w-full px-2.5 gap-2.5' : 'w-10 justify-center'
                } ${
                  isActive
                    ? 'bg-[#E8F6FD] text-[#0298D8]'
                    : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-800'
                }`}
              >
                {/* Left Active Bar Indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[#0298D8]" />
                )}

                <span className="shrink-0">{item.icon}</span>
                {expanded && (
                  <span className="text-xs font-semibold truncate">{item.label}</span>
                )}

                {/* Collapsed Floating Tooltip */}
                {!expanded && (
                  <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-full ml-2.5 px-2.5 py-1 rounded-lg bg-[#0F172A] text-white text-[11px] font-semibold whitespace-nowrap shadow-lg z-50 border border-slate-700/60">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Theme Switch & Utilities */}
      <div className={`flex flex-col gap-1.5 w-full ${expanded ? '' : 'items-center'}`}>
        {/* Light / Dark Theme Switch */}
        {expanded ? (
          <div className="p-1 rounded-xl bg-slate-100 border border-slate-200/80 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => onThemeChange('light')}
              className={`h-7 rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-semibold transition cursor-pointer ${
                !isDark
                  ? 'bg-white text-[#0F172A] shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => onThemeChange('dark')}
              className={`h-7 rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-semibold transition cursor-pointer ${
                isDark
                  ? 'bg-[#0298D8] text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onThemeChange(isDark ? 'light' : 'dark')}
            className="group relative h-9 w-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-[#0298D8] transition cursor-pointer"
            aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
          >
            {isDark ? (
              <Sun className="w-[17px] h-[17px] text-amber-400" />
            ) : (
              <Moon className="w-[17px] h-[17px]" />
            )}
            <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-full ml-2.5 px-2.5 py-1 rounded-lg bg-[#0F172A] text-white text-[11px] font-semibold whitespace-nowrap shadow-lg z-50 border border-slate-700/60">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={onSignOut}
          className={`group relative h-9 rounded-xl flex items-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer ${
            expanded ? 'w-full px-2.5 gap-2.5' : 'w-10 justify-center'
          }`}
        >
          <LogOut className="w-[17px] h-[17px] shrink-0" />
          {expanded && <span className="text-xs font-medium">Sign Out</span>}
          {!expanded && (
            <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-full ml-2.5 px-2.5 py-1 rounded-lg bg-[#0F172A] text-white text-[11px] font-semibold whitespace-nowrap shadow-lg z-50 border border-slate-700/60">
              Sign Out
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
