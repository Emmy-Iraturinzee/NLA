import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  MapPin,
  RotateCcw,
  Settings,
  TrendingUp,
  X,
  XCircle,
} from 'lucide-react';
import {
  KPI_CARDS_META,
  LAND_USE_BREAKDOWN,
  MONTHLY_ACTIVITY_DATA,
  TRANSACTION_SOURCE_TOTALS,
} from '../data/mockLaisData';
import {
  IntegrationSource,
  KpiStatusKey,
  ParcelRecord,
  ProvinceName,
} from '../types/lais';
import {
  DateRangePicker,
  DateRangeValue,
  formatDateRangeLabel,
} from './DateRangePicker';

interface DashboardViewProps {
  parcels: ParcelRecord[];
  selectedKpi: KpiStatusKey | null;
  onSelectKpi: (kpi: KpiStatusKey | null) => void;
  sourceFilter: 'All Sources' | IntegrationSource;
  onSourceFilterChange: (src: 'All Sources' | IntegrationSource) => void;
  onOpenParcel: (upi: string) => void;
  showActionBanner: boolean;
  onDismissActionBanner: () => void;
}

const DEFAULT_DATE_RANGE: DateRangeValue = {
  from: '2026-09-15',
  to: '2026-09-18',
};

const PROVINCES: Array<'All Provinces' | Exclude<ProvinceName, 'National'>> = [
  'All Provinces',
  'Kigali City',
  'Southern',
  'Western',
  'Northern',
  'Eastern',
];

const SOURCES: Array<'All Sources' | IntegrationSource> = [
  'All Sources',
  'LAIS',
  'IREMBO',
  'IECMS',
  'BPMIS',
  'Ubutaka',
  'IFMIS',
  'RDB',
];

function getKpiIcon(key: KpiStatusKey, active: boolean, isNegative?: boolean) {
  const cls = `w-3.5 h-3.5 transition-colors ${
    active
      ? 'text-white'
      : isNegative
      ? 'text-rose-500'
      : 'text-[#0298D8]'
  }`;
  switch (key) {
    case 'Received':
      return <Download className={cls} />;
    case 'Booked':
      return <Calendar className={cls} />;
    case 'Accepted':
    case 'Approved':
    case 'Completed':
      return <CheckCircle2 className={cls} />;
    case 'Processing':
    case 'Processed':
      return <Settings className={cls} />;
    case 'Returned':
      return <RotateCcw className={cls} />;
    case 'Rejected':
      return <XCircle className={cls} />;
  }
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  parcels,
  selectedKpi,
  onSelectKpi,
  sourceFilter,
  onSourceFilterChange,
  onOpenParcel,
  showActionBanner,
  onDismissActionBanner,
}) => {
  const [provinceFilter, setProvinceFilter] = useState<'All Provinces' | Exclude<ProvinceName, 'National'>>('All Provinces');
  const [dateRange, setDateRange] = useState<DateRangeValue>(DEFAULT_DATE_RANGE);
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);
  const [hoveredLandUse, setHoveredLandUse] = useState<string | null>(null);
  const [hoveredSource, setHoveredSource] = useState<IntegrationSource | null>(null);
  const [tablePage, setTablePage] = useState(1);

  const provinceMultiplier = useMemo(() => {
    if (provinceFilter === 'All Provinces') return 1;
    if (provinceFilter === 'Kigali City') return 0.44;
    if (provinceFilter === 'Southern') return 0.16;
    if (provinceFilter === 'Eastern') return 0.15;
    if (provinceFilter === 'Northern') return 0.13;
    return 0.12;
  }, [provinceFilter]);

  const sourceMultiplier = useMemo(() => {
    if (sourceFilter === 'All Sources') return 1;
    const found = TRANSACTION_SOURCE_TOTALS.find((s) => s.source === sourceFilter);
    return found ? found.percent / 100 : 0.2;
  }, [sourceFilter]);

  const dateMultiplier = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return 1;
    if (
      dateRange.from === DEFAULT_DATE_RANGE.from &&
      dateRange.to === DEFAULT_DATE_RANGE.to
    ) {
      return 1;
    }
    const startMs = new Date(dateRange.from).getTime();
    const endMs = new Date(dateRange.to).getTime();
    const days = Math.max(1, Math.round((endMs - startMs) / 86400000) + 1);
    return Math.min(1.4, Math.max(0.22, 0.35 + (days / 30) * 0.65));
  }, [dateRange]);

  const scaleFactor = provinceMultiplier * sourceMultiplier * dateMultiplier;

  // Compute filtered records for drilldown table
  const filteredParcels = useMemo(() => {
    const hasExactDateOverlap =
      Boolean(dateRange.from && dateRange.to) &&
      parcels.some((p) => p.date >= dateRange.from! && p.date <= dateRange.to!);

    return parcels.filter((p) => {
      if (provinceFilter !== 'All Provinces' && p.province !== provinceFilter) return false;
      if (sourceFilter !== 'All Sources' && p.source !== sourceFilter) return false;
      if (hasExactDateOverlap && dateRange.from && dateRange.to) {
        if (p.date < dateRange.from || p.date > dateRange.to) return false;
      }
      // When Received is active on default filters, prioritize matching status or show all 48 if default
      if (selectedKpi) {
        if (
          selectedKpi === 'Received' &&
          provinceFilter === 'All Provinces' &&
          sourceFilter === 'All Sources' &&
          !hasExactDateOverlap
        ) {
          return true;
        }
        return p.status === selectedKpi;
      }
      return true;
    });
  }, [parcels, provinceFilter, sourceFilter, selectedKpi, dateRange]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredParcels.length / pageSize));
  const safePage = Math.min(tablePage, totalPages);
  const pagedParcels = filteredParcels.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Smooth SVG path for Monthly Activity line chart
  const chartPoints = useMemo(() => {
    const w = 520;
    const h = 165;
    const padX = 14;
    const padTop = 12;
    const padBottom = 16;
    const maxY = 800;

    return MONTHLY_ACTIVITY_DATA.map((d, i) => {
      const scaledVal = Math.round(d.value * scaleFactor);
      const x = padX + (i * (w - padX * 2)) / (MONTHLY_ACTIVITY_DATA.length - 1);
      const y = padTop + (1 - Math.min(scaledVal, maxY) / maxY) * (h - padTop - padBottom);
      return { ...d, scaledVal, x, y };
    });
  }, [scaleFactor]);

  const linePath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    return chartPoints.reduce((acc, pt, idx, arr) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      const prev = arr[idx - 1];
      const cx1 = prev.x + (pt.x - prev.x) * 0.45;
      const cx2 = prev.x + (pt.x - prev.x) * 0.55;
      return `${acc} C ${cx1} ${prev.y}, ${cx2} ${pt.y}, ${pt.x} ${pt.y}`;
    }, '');
  }, [chartPoints]);

  const areaPath = useMemo(() => {
    if (!linePath || chartPoints.length === 0) return '';
    const last = chartPoints[chartPoints.length - 1];
    const first = chartPoints[0];
    return `${linePath} L ${last.x} 162 L ${first.x} 162 Z`;
  }, [linePath, chartPoints]);

  // Donut Chart Calculations
  const donutSegments = useMemo(() => {
    const total = LAND_USE_BREAKDOWN.reduce((s, item) => s + item.count, 0);
    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    let cumulative = 0;
    return LAND_USE_BREAKDOWN.map((item) => {
      const scaledCount = Math.round(item.count * scaleFactor);
      const frac = item.count / total;
      const dashLen = frac * circumference;
      const gapLen = circumference - dashLen;
      const offset = -cumulative * circumference;
      cumulative += frac;
      return {
        ...item,
        scaledCount,
        dashArray: `${Math.max(0, dashLen - 2)} ${gapLen + 2}`,
        dashOffset: offset,
      };
    });
  }, [scaleFactor]);

  const sourceScale = provinceMultiplier * dateMultiplier;
  const totalSourceTransactions = Math.round(10120 * sourceScale);

  return (
    <div className="relative flex-1 overflow-y-auto px-5 lg:px-7 py-5 space-y-5">
      {/* Subtle warm radial wash matching Image 1 bottom-right */}
      <div
        className="pointer-events-none fixed bottom-0 right-0 w-[45vw] h-[45vh] -z-10 opacity-40"
        style={{
          background: 'radial-gradient(circle at 85% 85%, #FBEEDB 0%, transparent 65%)',
        }}
      />

      {/* Action Required Executive Accent Toast (Appears 3s after dashboard load) */}
      <AnimatePresence>
        {showActionBanner && (
          <motion.div
            key="action-required-toast"
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[76px] right-5 z-50 w-[360px] max-w-[calc(100vw-2.5rem)] bg-white rounded-xl border border-slate-200/90 shadow-[0_14px_38px_rgba(15,23,42,0.14)] overflow-hidden flex"
          >
            <div className="w-1 bg-amber-500 shrink-0" />
            <div className="p-4 flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[13px] font-bold text-[#0F172A]">Action Required</h4>
                      <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/70">
                        5 Overdue
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onDismissActionBanner}
                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                      aria-label="Dismiss action alert"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                    5 land transactions have exceeded SLA targets and require your review.
                  </p>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onDismissActionBanner}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Later
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectKpi('Received');
                    onDismissActionBanner();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0298D8] hover:bg-[#0284C7] text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  <span>Review Queue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {selectedKpi && (
            <div className="inline-flex items-center gap-2 text-xs text-slate-500">
              <span>Filtering dashboard by</span>
              <span className="px-2 py-0.5 rounded-full bg-[#E6F6FD] text-[#0284C7] font-semibold">
                {selectedKpi}
              </span>
              <button
                type="button"
                onClick={() => onSelectKpi(null)}
                className="text-[#0298D8] hover:underline font-medium cursor-pointer"
              >
                Reset to overview
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!selectedKpi && (
            <>
              {/* Province Dropdown */}
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={provinceFilter}
                  onChange={(e) => {
                    setProvinceFilter(e.target.value as typeof provinceFilter);
                    setTablePage(1);
                  }}
                  className="h-9 pl-8 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 appearance-none shadow-2xs hover:border-slate-300 focus:outline-none focus:border-[#0298D8] cursor-pointer"
                >
                  {PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Source Dropdown */}
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sourceFilter}
                  onChange={(e) => {
                    onSourceFilterChange(e.target.value as typeof sourceFilter);
                    setTablePage(1);
                  }}
                  className="h-9 pl-8 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 appearance-none shadow-2xs hover:border-slate-300 focus:outline-none focus:border-[#0298D8] cursor-pointer"
                >
                  {SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </>
          )}

          {/* Date Range Picker Popover */}
          <DateRangePicker
            value={dateRange}
            onChange={(next) => {
              setDateRange(next);
              setTablePage(1);
            }}
          />
        </div>
      </div>

      {/* KPI Status Section: Compact 3x3 Grid OR Focused Active Card + ~10% Recessed Strip */}
      {(() => {
        const totalKpiVolume = KPI_CARDS_META.reduce(
          (sum, item) => sum + Math.max(1, Math.round(item.baseCount * scaleFactor)),
          0
        );
        const activeMeta = selectedKpi
          ? KPI_CARDS_META.find((k) => k.key === selectedKpi) ?? null
          : null;
        const dismissedCards = selectedKpi
          ? KPI_CARDS_META.filter((k) => k.key !== selectedKpi)
          : [];

        return (
          <AnimatePresence mode="wait">
            {activeMeta ? (
              <motion.div
                key="kpi-focused-mode"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col lg:flex-row items-stretch gap-2.5"
              >
                {/* Selected Card (Prominent) */}
                {(() => {
                  const displayCount = Math.max(
                    1,
                    Math.round(activeMeta.baseCount * scaleFactor)
                  );
                  const sharePct = Math.max(
                    1,
                    Math.round((displayCount / Math.max(1, totalKpiVolume)) * 100)
                  );
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectKpi(null);
                        setTablePage(1);
                      }}
                      title="Click to restore all KPI cards"
                      className="lg:w-[290px] shrink-0 rounded-xl px-3.5 py-2.5 border border-[#0895D8] bg-[#0895D8] text-white text-left shadow-[0_8px_20px_rgba(8,149,216,0.24)] transition hover:bg-[#0787C5] cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center shrink-0">
                            {getKpiIcon(activeMeta.key, true, activeMeta.isNegative)}
                          </div>
                          <span className="text-[10.5px] font-bold tracking-wider uppercase text-white/95 truncate">
                            {activeMeta.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/20 text-white text-[10.5px] font-semibold tabular-nums">
                            <TrendingUp className="w-2.5 h-2.5" />
                            {activeMeta.delta}
                          </span>
                          <span className="w-5 h-5 rounded-md bg-white/15 hover:bg-white/25 flex items-center justify-center">
                            <X className="w-3 h-3 text-white" />
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 flex items-baseline justify-between gap-2">
                        <div className="text-[20px] font-bold leading-none tracking-tight tabular-nums text-white">
                          {displayCount.toLocaleString()}
                        </div>
                        <span className="text-[10.5px] font-medium tabular-nums text-white/80">
                          {sharePct}% · Click to show all
                        </span>
                      </div>

                      <div className="mt-2 h-1 w-full rounded-full overflow-hidden bg-white/20">
                        <div
                          className="h-full rounded-full bg-white transition-all duration-300"
                          style={{ width: `${Math.max(5, Math.min(100, sharePct * 3))}%` }}
                        />
                      </div>
                    </button>
                  );
                })()}

                {/* Dismissed Remaining Cards (~10% subtle visual weight / compact switcher) */}
                <div className="flex-1 min-w-0 rounded-xl border border-slate-200/70 bg-white/60 px-3 py-2 flex flex-wrap items-center content-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mr-1">
                    Other:
                  </span>
                  {dismissedCards.map((kpi) => {
                    const count = Math.max(1, Math.round(kpi.baseCount * scaleFactor));
                    return (
                      <button
                        key={kpi.key}
                        type="button"
                        onClick={() => {
                          onSelectKpi(kpi.key);
                          setTablePage(1);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200/80 bg-white hover:border-[#0298D8]/60 hover:bg-[#F4FAFE] text-[11px] transition cursor-pointer"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            kpi.isNegative ? 'bg-rose-400' : 'bg-[#0298D8]'
                          }`}
                        />
                        <span className="font-semibold text-slate-600">{kpi.key}</span>
                        <span className="font-mono-code text-[10.5px] font-semibold text-slate-400 tabular-nums">
                          {count.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="kpi-grid-mode"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              >
                {KPI_CARDS_META.map((kpi) => {
                  const displayCount = Math.max(1, Math.round(kpi.baseCount * scaleFactor));
                  const sharePct = Math.max(
                    1,
                    Math.round((displayCount / Math.max(1, totalKpiVolume)) * 100)
                  );

                  return (
                    <button
                      key={kpi.key}
                      type="button"
                      onClick={() => {
                        onSelectKpi(kpi.key);
                        setTablePage(1);
                      }}
                      className="group relative rounded-xl px-3.5 py-2.5 border border-slate-200/85 bg-white hover:border-[#0298D8]/50 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)] text-left transition-all duration-150 overflow-hidden cursor-pointer"
                    >
                      {/* Row 1: Icon + Label + Trend Pill */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                              kpi.isNegative
                                ? 'bg-rose-50 border border-rose-100'
                                : 'bg-[#EFF8FD] border border-[#DCEFFA]'
                            }`}
                          >
                            {getKpiIcon(kpi.key, false, kpi.isNegative)}
                          </div>
                          <span className="text-[10.5px] font-bold tracking-wider uppercase truncate text-slate-500">
                            {kpi.label}
                          </span>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10.5px] font-semibold tabular-nums shrink-0 ${
                            kpi.isNegative
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          <TrendingUp className="w-2.5 h-2.5" />
                          {kpi.delta}
                        </span>
                      </div>

                      {/* Row 2: Primary Count + Share Context */}
                      <div className="mt-2 flex items-baseline justify-between gap-2">
                        <div className="text-[20px] font-bold leading-none tracking-tight tabular-nums text-[#0F172A]">
                          {displayCount.toLocaleString()}
                        </div>
                        <span className="text-[10.5px] font-medium tabular-nums text-slate-400">
                          {sharePct}% of volume
                        </span>
                      </div>

                      {/* Row 3: Proportional Pipeline Share Bar */}
                      <div className="mt-2 h-1 w-full rounded-full overflow-hidden bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            kpi.isNegative ? 'bg-rose-400' : 'bg-[#0298D8]'
                          }`}
                          style={{ width: `${Math.max(5, Math.min(100, sharePct * 3))}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        );
      })()}

      {/* Conditional View: Drilldown Parcel Records Table (Image 3) OR Analytics Charts (Image 1) */}
      <AnimatePresence mode="wait">
      {selectedKpi ? (
        <motion.div
          key="dashboard-table"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-[#0F172A]">Parcel Records</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                  {filteredParcels.length}
                </span>
              </div>
              <p className="text-[11.5px] text-slate-400 mt-0.5">
                {formatDateRangeLabel(dateRange)} · {filteredParcels.length} total records
              </p>
            </div>

            <div className="flex items-center gap-2">
              {sourceFilter !== 'All Sources' && (
                <button
                  type="button"
                  onClick={() => onSourceFilterChange('All Sources')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#EFF8FD] text-[#0284C7] text-xs font-semibold hover:bg-[#E0F2FE] cursor-pointer"
                >
                  Source: {sourceFilter} ×
                </button>
              )}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 bg-white">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formatDateRangeLabel(dateRange)}
              </div>
            </div>
          </div>

          {/* 7 Integration Source Mini-Bars (Image 3) */}
          <div className="px-5 py-3.5 border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 bg-[#FCFDFE]">
            {TRANSACTION_SOURCE_TOTALS.map((src) => {
              const isSelectedSource = sourceFilter === src.source;
              return (
                <button
                  key={src.source}
                  type="button"
                  onClick={() => {
                    onSourceFilterChange(isSelectedSource ? 'All Sources' : src.source);
                    setTablePage(1);
                  }}
                  className={`text-left group rounded-lg p-1.5 -m-1.5 transition cursor-pointer ${
                    isSelectedSource ? 'bg-[#EFF8FD]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="font-bold text-[#0F172A] group-hover:text-[#0298D8]">
                      {src.source}
                    </span>
                    <span className="text-slate-400 font-medium">{src.percent}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0298D8] transition-all"
                      style={{ width: `${Math.max(8, src.percent * 2)}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                    {src.recordsCount}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Parcel Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10.5px] font-semibold tracking-wider text-slate-400 uppercase bg-white">
                  <th className="py-3 px-5 w-14">#</th>
                  <th className="py-3 px-4">UPI</th>
                  <th className="py-3 px-4">OWNER</th>
                  <th className="py-3 px-4">LAND USE</th>
                  <th className="py-3 px-4">SIZE (SQM)</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {pagedParcels.map((parcel) => (
                  <tr
                    key={parcel.id}
                    onClick={() => onOpenParcel(parcel.upi)}
                    className="hover:bg-[#F7FBFE] transition cursor-pointer group"
                  >
                    <td className="py-3.5 px-5 text-slate-400 font-mono-code text-xs">
                      {parcel.indexNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono-code font-semibold text-[#0298D8] text-xs group-hover:underline">
                      {parcel.upi}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#0F172A]">{parcel.owner}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {parcel.landUse}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono-code text-xs text-slate-700">
                      {parcel.sizeSqm.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          parcel.status === 'Returned' || parcel.status === 'Rejected'
                            ? 'bg-red-50 text-red-600'
                            : parcel.status === 'Approved' || parcel.status === 'Completed'
                            ? 'bg-[#E6F6FD] text-[#0284C7]'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {parcel.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono-code text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-300" />
                        {parcel.date}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenParcel(parcel.upi);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0298D8] hover:text-[#0284C7] cursor-pointer"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}

                {pagedParcels.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-sm text-slate-500">
                      No parcel records match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredParcels.length > pageSize && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {(safePage - 1) * pageSize + 1}–
                {Math.min(safePage * pageSize, filteredParcels.length)} of {filteredParcels.length}{' '}
                records
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setTablePage(pg)}
                    className={`w-7 h-7 rounded-md font-semibold transition cursor-pointer ${
                      pg === safePage
                        ? 'bg-[#0298D8] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        /* Overview Analytics Grid (Image 1) */
        <motion.div
          key="dashboard-overview"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Monthly Activity Chart */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-5">
              <div className="text-[10.5px] font-semibold tracking-wider text-slate-400 uppercase">
                TRANSACTION VOLUME
              </div>
              <h3 className="text-[15px] font-bold text-[#0F172A] mt-0.5">Monthly Activity</h3>

              <div className="mt-4 relative">
                <svg viewBox="0 0 560 195" className="w-full h-[200px] overflow-visible">
                  <defs>
                    <linearGradient id="monthlyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0298D8" stopOpacity="0.16" />
                      <stop offset="100%" stopColor="#0298D8" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Y-Grid & Labels */}
                  {[0, 200, 400, 600, 800].map((val) => {
                    const y = 12 + (1 - val / 800) * (165 - 12 - 16);
                    return (
                      <g key={val}>
                        <line
                          x1="34"
                          y1={y}
                          x2="548"
                          y2={y}
                          stroke="#EEF2F6"
                          strokeWidth="1"
                        />
                        <text
                          x="26"
                          y={y + 3}
                          textAnchor="end"
                          fontSize="10"
                          fill="#94A3B8"
                          fontFamily="Inter, sans-serif"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Chart Group shifted right for Y-axis */}
                  <g transform="translate(34, 0)">
                    <path d={areaPath} fill="url(#monthlyAreaGrad)" />
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#0298D8"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />

                    {/* X-axis Labels & Interactive Hover Targets */}
                    {chartPoints.map((pt, idx) => (
                      <g
                        key={pt.month}
                        onMouseEnter={() => setHoveredMonthIdx(idx)}
                        onMouseLeave={() => setHoveredMonthIdx(null)}
                        className="cursor-pointer"
                      >
                        <rect x={pt.x - 16} y={0} width={32} height={180} fill="transparent" />
                        {hoveredMonthIdx === idx && (
                          <>
                            <line
                              x1={pt.x}
                              y1={12}
                              x2={pt.x}
                              y2={162}
                              stroke="#BAE6FD"
                              strokeDasharray="3 3"
                            />
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="4.5"
                              fill="#0298D8"
                              stroke="#FFFFFF"
                              strokeWidth="2"
                            />
                          </>
                        )}
                        <text
                          x={pt.x}
                          y={182}
                          textAnchor="middle"
                          fontSize="10.5"
                          fill={hoveredMonthIdx === idx ? '#0284C7' : '#94A3B8'}
                          fontWeight={hoveredMonthIdx === idx ? '600' : '400'}
                        >
                          {pt.month}
                        </text>
                      </g>
                    ))}
                  </g>
                </svg>

                {/* Hover Tooltip */}
                {hoveredMonthIdx !== null && chartPoints[hoveredMonthIdx] && (
                  <div className="absolute top-2 right-3 bg-[#0F172A] text-white text-xs px-2.5 py-1.5 rounded-lg shadow-md pointer-events-none">
                    <span className="font-semibold">{chartPoints[hoveredMonthIdx].month}:</span>{' '}
                    <span className="font-mono-code">
                      {chartPoints[hoveredMonthIdx].scaledVal}
                    </span>{' '}
                    txns
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-[#0298D8]" />
                <span>Trend over 12 months</span>
              </div>
            </div>

            {/* Right: Land Use Breakdown Donut */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-5">
              <div className="text-[10.5px] font-semibold tracking-wider text-slate-400 uppercase">
                PARCEL DISTRIBUTION
              </div>
              <h3 className="text-[15px] font-bold text-[#0F172A] mt-0.5">Land Use Breakdown</h3>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-around gap-6">
                {/* Donut SVG */}
                <div className="relative w-[176px] h-[176px] flex items-center justify-center">
                  <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                    {donutSegments.map((seg) => (
                      <circle
                        key={seg.name}
                        cx="80"
                        cy="80"
                        r="56"
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth={hoveredLandUse === seg.name ? 30 : 26}
                        strokeDasharray={seg.dashArray}
                        strokeDashoffset={seg.dashOffset}
                        onMouseEnter={() => setHoveredLandUse(seg.name)}
                        onMouseLeave={() => setHoveredLandUse(null)}
                        className="transition-all duration-150 cursor-pointer"
                      />
                    ))}
                  </svg>
                  {hoveredLandUse && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {hoveredLandUse}
                      </span>
                      <span className="text-sm font-bold text-[#0F172A]">
                        {donutSegments
                          .find((d) => d.name === hoveredLandUse)
                          ?.scaledCount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="w-full max-w-[230px] space-y-2.5">
                  {donutSegments.map((seg) => (
                    <div
                      key={seg.name}
                      onMouseEnter={() => setHoveredLandUse(seg.name)}
                      onMouseLeave={() => setHoveredLandUse(null)}
                      className={`flex items-center justify-between text-xs px-2 py-1 rounded-md transition cursor-pointer ${
                        hoveredLandUse === seg.name ? 'bg-slate-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span className="text-slate-600 font-medium">{seg.name}</span>
                      </div>
                      <span className="font-semibold text-[#0F172A] tabular-nums">
                        {seg.scaledCount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Integration Transaction Source Card: Proportional Bento Treemap + Ranked List */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-[10.5px] font-semibold tracking-wider text-slate-400 uppercase">
                  INTEGRATION
                </div>
                <h3 className="text-[15px] font-bold text-[#0F172A] mt-0.5">Transaction Source</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proportional volume across connected systems — click any channel to inspect records
                </p>
              </div>

              <div className="text-right min-w-[110px]">
                <div className="text-[22px] font-bold text-[#0F172A] leading-none tabular-nums">
                  {totalSourceTransactions.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {hoveredSource ? (
                    <span className="text-[#0284C7] font-semibold">
                      {hoveredSource}:{' '}
                      {Math.round(
                        (TRANSACTION_SOURCE_TOTALS.find((s) => s.source === hoveredSource)?.count ??
                          0) * sourceScale
                      ).toLocaleString()}{' '}
                      ({TRANSACTION_SOURCE_TOTALS.find((s) => s.source === hoveredSource)?.percent}%)
                    </span>
                  ) : (
                    'Total transactions'
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left: Mathematically Proportional Bento Treemap (7 cols) */}
              <div className="lg:col-span-7 flex flex-col sm:flex-row gap-2 min-h-[240px]">
                {(() => {
                  const byName = Object.fromEntries(
                    TRANSACTION_SOURCE_TOTALS.map((s) => [s.source, s])
                  ) as Record<IntegrationSource, (typeof TRANSACTION_SOURCE_TOTALS)[number]>;

                  const renderBlock = (
                    item: (typeof TRANSACTION_SOURCE_TOTALS)[number],
                    extraClass: string,
                    compact = false,
                    inline = false
                  ) => {
                    const scaledCount = Math.round(item.count * sourceScale);
                    const isDimmed = hoveredSource !== null && hoveredSource !== item.source;
                    const isActive = hoveredSource === item.source || sourceFilter === item.source;
                    return (
                      <button
                        key={item.source}
                        type="button"
                        onMouseEnter={() => setHoveredSource(item.source)}
                        onMouseLeave={() => setHoveredSource(null)}
                        onClick={() => {
                          onSourceFilterChange(item.source);
                          onSelectKpi('Received');
                          setTablePage(1);
                        }}
                        style={{ backgroundColor: item.color }}
                        className={`rounded-xl text-white text-left transition-all duration-150 cursor-pointer flex overflow-hidden ${
                          inline
                            ? 'flex-row items-center justify-between px-2.5 py-1.5'
                            : compact
                            ? 'flex-col justify-between px-2.5 py-2'
                            : 'flex-col justify-between p-3.5'
                        } ${isDimmed ? 'opacity-45' : 'opacity-100'} ${
                          isActive ? 'ring-2 ring-offset-2 ring-[#0298D8]' : 'hover:brightness-105'
                        } ${extraClass}`}
                      >
                        {inline ? (
                          <>
                            <span className="text-[11px] font-bold truncate">{item.source}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[11px] font-bold tabular-nums">
                                {scaledCount.toLocaleString()}
                              </span>
                              <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full tabular-nums">
                                {item.percent}%
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between gap-1.5 w-full">
                              <span
                                className={`font-bold truncate ${
                                  compact ? 'text-[11px]' : 'text-xs'
                                }`}
                              >
                                {item.source}
                              </span>
                              <span className="text-[10.5px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full tabular-nums shrink-0">
                                {item.percent}%
                              </span>
                            </div>

                            <div className="mt-1">
                              {!compact && (
                                <div className="text-[10.5px] text-white/80 truncate">
                                  {item.role}
                                </div>
                              )}
                              <div
                                className={`font-bold tabular-nums leading-tight ${
                                  compact ? 'text-xs' : 'text-[17px] mt-0.5'
                                }`}
                              >
                                {scaledCount.toLocaleString()}
                              </div>
                            </div>
                          </>
                        )}
                      </button>
                    );
                  };

                  return (
                    <>
                      {/* LAIS: 38% width */}
                      <div className="sm:w-[38%] flex">
                        {renderBlock(byName.LAIS, 'w-full min-h-[120px]')}
                      </div>

                      {/* Remaining 62% width split into top (40%) & bottom (22%) rows */}
                      <div className="sm:w-[62%] flex flex-col gap-2">
                        {/* Top Row: IREMBO (25%) + IECMS (15%) */}
                        <div className="flex-[40] flex gap-2 min-h-[122px]">
                          {renderBlock(byName.IREMBO, 'w-[62.5%]')}
                          {renderBlock(byName.IECMS, 'w-[37.5%]')}
                        </div>

                        {/* Bottom Row: BPMIS (10%) + Ubutaka (6%) + IFMIS/RDB (4%+2%) */}
                        <div className="flex-[22] flex gap-2 min-h-[108px]">
                          {renderBlock(byName.BPMIS, 'w-[45.5%]')}
                          {renderBlock(byName.Ubutaka, 'w-[27.3%]', true)}
                          <div className="w-[27.2%] flex flex-col gap-1.5">
                            {renderBlock(byName.IFMIS, 'flex-[2]', true)}
                            {renderBlock(byName.RDB, 'flex-[1]', true, true)}
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Right: Companion Ranked Breakdown List (5 cols) */}
              <div className="lg:col-span-5 rounded-xl border border-slate-200/80 bg-[#FCFDFE] p-2.5 flex flex-col justify-between gap-1">
                {TRANSACTION_SOURCE_TOTALS.map((item) => {
                  const scaledCount = Math.round(item.count * sourceScale);
                  const isActive = hoveredSource === item.source || sourceFilter === item.source;
                  return (
                    <button
                      key={item.source}
                      type="button"
                      onMouseEnter={() => setHoveredSource(item.source)}
                      onMouseLeave={() => setHoveredSource(null)}
                      onClick={() => {
                        onSourceFilterChange(item.source);
                        onSelectKpi('Received');
                        setTablePage(1);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-3 text-left transition cursor-pointer ${
                        isActive ? 'bg-[#EFF8FD]' : 'hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-bold text-[#0F172A]">{item.source}</span>
                        <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
                          · {item.role}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 tabular-nums">
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                          {item.delta}
                        </span>
                        <span className="text-xs font-semibold text-[#0F172A] w-12 text-right">
                          {scaledCount.toLocaleString()}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 w-8 text-right">
                          {item.percent}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};
