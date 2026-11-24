import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export interface DateRangeValue {
  from: string | null; // YYYY-MM-DD
  to: string | null;   // YYYY-MM-DD
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];

function parseIsoDate(iso: string): { year: number; month: number; day: number } {
  const [y, m, d] = iso.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function formatDateRangeLabel(range: DateRangeValue): string {
  if (!range.from && !range.to) {
    return 'All Time';
  }
  const formatOne = (iso: string) => {
    const { year, month, day } = parseIsoDate(iso);
    return `${String(day).padStart(2, '0')} ${SHORT_MONTHS[month]} ${year}`;
  };
  if (range.from && range.to) {
    return `${formatOne(range.from)} - ${formatOne(range.to)}`;
  }
  if (range.from) {
    return `From ${formatOne(range.from)}`;
  }
  return `Until ${formatOne(range.to!)}`;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const [draftFrom, setDraftFrom] = useState<string | null>(value.from);
  const [draftTo, setDraftTo] = useState<string | null>(value.to);
  const [activeField, setActiveField] = useState<'from' | 'to'>('from');
  const [hoverIso, setHoverIso] = useState<string | null>(null);

  const initialCal = useMemo(() => {
    if (value.from) {
      const p = parseIsoDate(value.from);
      return { year: p.year, month: p.month };
    }
    return { year: 2026, month: 8 }; // September 2026
  }, [value.from]);

  const [viewYear, setViewYear] = useState(initialCal.year);
  const [viewMonth, setViewMonth] = useState(initialCal.month);

  // Sync draft when opening
  const handleToggleOpen = () => {
    if (!open) {
      setDraftFrom(value.from);
      setDraftTo(value.to);
      setActiveField('from');
      setHoverIso(null);
      if (value.from) {
        const p = parseIsoDate(value.from);
        setViewYear(p.year);
        setViewMonth(p.month);
      }
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const calendarCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<{ day: number | null; iso: string | null }> = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, iso: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, iso: toIsoDate(viewYear, viewMonth, d) });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const handleDayClick = (iso: string) => {
    if (activeField === 'from') {
      setDraftFrom(iso);
      if (draftTo && iso > draftTo) {
        setDraftTo(null);
      }
      setActiveField('to');
    } else {
      if (!draftFrom || iso < draftFrom) {
        setDraftFrom(iso);
        setDraftTo(null);
        setActiveField('to');
      } else {
        setDraftTo(iso);
      }
    }
  };

  const handleSelectField = (field: 'from' | 'to') => {
    setActiveField(field);
    const targetIso = field === 'from' ? draftFrom : draftTo;
    if (targetIso) {
      const p = parseIsoDate(targetIso);
      setViewYear(p.year);
      setViewMonth(p.month);
    }
  };

  const handleClear = () => {
    setDraftFrom(null);
    setDraftTo(null);
    setActiveField('from');
    setHoverIso(null);
  };

  const handleDone = () => {
    const finalFrom = draftFrom;
    const finalTo = draftFrom && !draftTo ? draftFrom : draftTo;
    onChange({ from: finalFrom, to: finalTo });
    setOpen(false);
  };

  const effectiveEnd =
    draftTo ?? (activeField === 'to' && draftFrom && hoverIso && hoverIso >= draftFrom ? hoverIso : null);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggleOpen}
        className={`h-9 pl-3 pr-2.5 rounded-lg border bg-white text-xs font-medium text-slate-700 shadow-2xs inline-flex items-center gap-2 transition cursor-pointer ${
          open
            ? 'border-[#0298D8] ring-2 ring-[#0298D8]/15'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="whitespace-nowrap">{formatDateRangeLabel(value)}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${
            open ? 'rotate-180 text-[#0298D8]' : ''
          }`}
        />
      </button>

      {/* Popover Calendar */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-1.5 z-50 w-[268px] bg-white rounded-xl border border-slate-200/90 shadow-[0_14px_34px_rgba(15,23,42,0.13)] p-3.5 select-none"
          >
            {/* FROM / TO Boxes */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectField('from')}
                className={`rounded-lg px-2.5 py-1.5 text-center transition cursor-pointer ${
                  activeField === 'from'
                    ? 'border-[1.5px] border-[#0EA5E9] bg-[#F4FAFE]'
                    : 'border border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`text-[9.5px] font-bold tracking-wider uppercase ${
                    activeField === 'from' ? 'text-[#0298D8]' : 'text-slate-400'
                  }`}
                >
                  FROM
                </div>
                <div
                  className={`text-[12.5px] font-bold mt-0.5 tabular-nums ${
                    activeField === 'from'
                      ? 'text-[#0298D8]'
                      : draftFrom
                      ? 'text-slate-600'
                      : 'text-slate-300'
                  }`}
                >
                  {draftFrom ?? 'YYYY-MM-DD'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectField('to')}
                className={`rounded-lg px-2.5 py-1.5 text-center transition cursor-pointer ${
                  activeField === 'to'
                    ? 'border-[1.5px] border-[#0EA5E9] bg-[#F4FAFE]'
                    : 'border border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`text-[9.5px] font-bold tracking-wider uppercase ${
                    activeField === 'to' ? 'text-[#0298D8]' : 'text-slate-400'
                  }`}
                >
                  TO
                </div>
                <div
                  className={`text-[12.5px] font-bold mt-0.5 tabular-nums ${
                    activeField === 'to'
                      ? 'text-[#0298D8]'
                      : draftTo
                      ? 'text-slate-600'
                      : 'text-slate-300'
                  }`}
                >
                  {draftTo ?? 'YYYY-MM-DD'}
                </div>
              </button>
            </div>

            {/* Month Header */}
            <div className="mt-3.5 mb-2 flex items-center justify-between px-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Previous month"
              >
                <svg className="w-2 h-2 fill-current" viewBox="0 0 8 12">
                  <path d="M7 1L2 6l5 5V1z" />
                </svg>
              </button>

              <div className="text-[13px] font-bold text-[#1E293B]">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Next month"
              >
                <svg className="w-2 h-2 fill-current" viewBox="0 0 8 12">
                  <path d="M1 1l5 5-5 5V1z" />
                </svg>
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-x-0.5 text-center mb-1">
              {WEEKDAYS.map((wd) => (
                <div key={wd} className="text-[10.5px] font-medium text-slate-400 py-0.5">
                  {wd}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div
              className="grid grid-cols-7 gap-y-1 gap-x-0.5"
              onMouseLeave={() => setHoverIso(null)}
            >
              {calendarCells.map((cell, idx) => {
                if (!cell.day || !cell.iso) {
                  return <div key={`empty-${idx}`} className="h-7" />;
                }

                const iso = cell.iso;
                const isStart = draftFrom === iso;
                const isEnd = draftTo === iso;
                const isPreviewEnd = !draftTo && effectiveEnd === iso && draftFrom !== iso;
                const isInRange =
                  Boolean(draftFrom && effectiveEnd) &&
                  iso > draftFrom! &&
                  iso < effectiveEnd!;

                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => handleDayClick(iso)}
                    onMouseEnter={() => setHoverIso(iso)}
                    className={`h-7 rounded-lg text-[11.5px] transition-all flex items-center justify-center cursor-pointer tabular-nums ${
                      isStart || isEnd
                        ? 'bg-[#0B9EDB] text-white font-semibold shadow-[0_2px_6px_rgba(11,158,219,0.26)]'
                        : isInRange
                        ? 'bg-[#EBF6FD] text-[#0298D8] font-medium hover:bg-[#DCF0FC]'
                        : isPreviewEnd
                        ? 'bg-[#D6EEFC] text-[#0284C7] font-semibold'
                        : 'text-[#1E293B] font-medium hover:bg-slate-100'
                    }`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-medium text-slate-400 hover:text-slate-700 px-1 py-0.5 rounded transition cursor-pointer"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={handleDone}
                className="px-4 py-1.5 rounded-lg bg-[#0B9EDB] hover:bg-[#0284C7] text-white text-xs font-semibold shadow-[0_2px_6px_rgba(11,158,219,0.26)] transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
