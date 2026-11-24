import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookPlus,
  Building2,
  ChevronDown,
  Compass,
  FileText,
  Landmark,
  MapPin,
  Repeat,
  RotateCcw,
  Search,
  User,
  X,
} from 'lucide-react';
import { LOCATION_HIERARCHY } from '../data/mockLaisData';
import { ParcelRecord, ProvinceName } from '../types/lais';

interface LandParcelSearchViewProps {
  parcels: ParcelRecord[];
  initialQuery?: string;
  onBack: () => void;
  onSelectParcel: (upi: string) => void;
  onBookParcel: (upi: string) => void;
}

type SearchTab = 'upi' | 'applications' | 'person' | 'other';
type PersonSearchType = 'NID' | 'Passport' | 'TIN' | 'Business' | 'Natural Person Name';
type SortOption = 'upi' | 'area-desc' | 'area-asc';

const PERSON_SEARCH_TYPES: Array<{
  id: PersonSearchType;
  label: string;
  placeholder: string;
}> = [
  { id: 'NID', label: 'NID', placeholder: 'Enter National ID number' },
  { id: 'Passport', label: 'Passport', placeholder: 'Enter Passport number' },
  { id: 'TIN', label: 'TIN', placeholder: 'Enter TIN number' },
  { id: 'Business', label: 'Business', placeholder: 'Enter Business name or registration' },
  {
    id: 'Natural Person Name',
    label: 'Natural Person Name',
    placeholder: 'Enter Natural Person Name',
  },
];

const OTHER_TRANSACTION_TYPES = [
  'All Other Transactions',
  'Cancel Restriction by Bankruptcy',
  'Court Order Caveat',
  'Tax Lien Notification',
  'Expropriation Annotation',
  'Caveat Lifting',
  'Mortgage Registration',
] as const;

type OtherTransactionType = (typeof OTHER_TRANSACTION_TYPES)[number] | '';

const CORPORATE_PATTERN =
  /\b(ltd|llc|inc|corp|plc|group|bank|hospital|ministry|co\.|holdings|enterprise|authority|board|university)\b/i;

export const LandParcelSearchView: React.FC<LandParcelSearchViewProps> = ({
  parcels,
  initialQuery = '',
  onBack,
  onSelectParcel,
  onBookParcel,
}) => {
  const [activeTab, setActiveTab] = useState<SearchTab>('upi');
  const [query, setQuery] = useState(initialQuery);

  // UPI / Location cascading filters
  const [province, setProvince] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [sector, setSector] = useState<string>('');
  const [cell, setCell] = useState<string>('');

  // Person search sub-type
  const [personSearchType, setPersonSearchType] = useState<PersonSearchType>('NID');

  // Other Transactions filter type
  const [otherTxType, setOtherTxType] = useState<OtherTransactionType>('');

  const [sortBy, setSortBy] = useState<SortOption>('upi');
  const [selectedUpi, setSelectedUpi] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeTab, personSearchType]);

  useEffect(() => {
    setQuery(initialQuery);
    const trimmed = initialQuery.trim();
    if (!trimmed) return;
    if (/^(app|trx|txn)-/i.test(trimmed)) {
      setActiveTab('applications');
    } else if (!/^\d+\//.test(trimmed) && !/[0-9]/.test(trimmed)) {
      const lower = trimmed.toLowerCase();
      const matchesLocation = parcels.some(
        (p) =>
          p.province.toLowerCase().includes(lower) ||
          p.district.toLowerCase().includes(lower) ||
          p.sector.toLowerCase().includes(lower) ||
          p.cell.toLowerCase().includes(lower) ||
          p.village.toLowerCase().includes(lower)
      );
      if (!matchesLocation) {
        setActiveTab('person');
        setPersonSearchType('Natural Person Name');
      }
    }
  }, [initialQuery, parcels]);

  const provinces = Object.keys(LOCATION_HIERARCHY) as Array<Exclude<ProvinceName, 'National'>>;
  const districts =
    province && LOCATION_HIERARCHY[province as Exclude<ProvinceName, 'National'>]
      ? Object.keys(LOCATION_HIERARCHY[province as Exclude<ProvinceName, 'National'>])
      : [];
  const sectors =
    province &&
    district &&
    LOCATION_HIERARCHY[province as Exclude<ProvinceName, 'National'>]?.[district]
      ? Object.keys(LOCATION_HIERARCHY[province as Exclude<ProvinceName, 'National'>][district])
      : [];
  const cells =
    province &&
    district &&
    sector &&
    LOCATION_HIERARCHY[province as Exclude<ProvinceName, 'National'>]?.[district]?.[sector]
      ? LOCATION_HIERARCHY[province as Exclude<ProvinceName, 'National'>][district][sector]
      : [];

  const clearLocationFilters = () => {
    setProvince('');
    setDistrict('');
    setSector('');
    setCell('');
  };

  const hasActiveSearch = useMemo(() => {
    const q = query.trim();
    if (activeTab === 'upi') return Boolean(q || province);
    if (activeTab === 'applications') return Boolean(q);
    if (activeTab === 'person') return Boolean(q);
    return Boolean(otherTxType || q);
  }, [activeTab, query, province, otherTxType]);

  const results = useMemo(() => {
    if (!hasActiveSearch) return [];
    const q = query.trim().toLowerCase();

    const filtered = parcels.filter((p) => {
      if (activeTab === 'upi') {
        if (province && p.province !== province) return false;
        if (district && p.district !== district) return false;
        if (sector && p.sector !== sector) return false;
        if (cell && p.cell !== cell) return false;

        if (!q) return true;
        // Full 5-segment UPI must match that exact UPI only
        if (/^\d+\/\d+\/\d+\/\d+\/\d+$/.test(q)) {
          return p.upi.toLowerCase() === q;
        }
        // Partial numeric / slash UPI fragment matches strictly against parcel UPI
        if (/[0-9/]/.test(q)) {
          return p.upi.toLowerCase().includes(q);
        }
        // Alphabetic location query matches administrative location names or UPI
        return (
          p.upi.toLowerCase().includes(q) ||
          p.village.toLowerCase().includes(q) ||
          p.cell.toLowerCase().includes(q) ||
          p.sector.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.province.toLowerCase().includes(q)
        );
      }

      if (activeTab === 'applications') {
        if (!q) return false;
        if (/^\d+\/\d+\/\d+\/\d+\/\d+$/.test(q)) {
          return p.upi.toLowerCase() === q;
        }
        return (
          p.transactionId.toLowerCase().includes(q) ||
          p.transactionId.replace('TRX-', 'APP-').toLowerCase().includes(q) ||
          p.upi.toLowerCase().includes(q) ||
          p.transactions.some(
            (t) =>
              t.reference.toLowerCase().includes(q) ||
              t.type.toLowerCase().includes(q) ||
              t.applicant.toLowerCase().includes(q)
          )
        );
      }

      if (activeTab === 'person') {
        if (!q) return false;
        const isCorporate =
          CORPORATE_PATTERN.test(p.owner) ||
          p.landUse === 'Commercial' ||
          p.landUse === 'Industrial';

        if (personSearchType === 'NID') {
          return (
            p.nationalId.toLowerCase().includes(q) ||
            (p.hasCondoUnits &&
              p.condoRights.some((r) => r.nationalId.toLowerCase().includes(q)))
          );
        }

        if (personSearchType === 'Passport') {
          return `pc${p.nationalId.slice(1, 8)}`.toLowerCase().includes(q);
        }

        if (personSearchType === 'TIN') {
          return isCorporate && `100${p.nationalId.slice(3, 9)}`.includes(q);
        }

        if (personSearchType === 'Business') {
          return isCorporate && p.owner.toLowerCase().includes(q);
        }

        // Natural Person Name
        if (CORPORATE_PATTERN.test(p.owner)) return false;
        return (
          p.owner.toLowerCase().includes(q) ||
          (p.hasCondoUnits && p.condoRights.some((r) => r.name.toLowerCase().includes(q)))
        );
      }

      // 'other' tab — Other Transactions
      const matchesOtherType = (() => {
        if (!otherTxType || otherTxType === 'All Other Transactions') {
          return p.transactions.some((t) => t.category === 'Other Txns') || p.restrictions.length > 0;
        }
        if (otherTxType === 'Cancel Restriction by Bankruptcy') {
          return p.restrictions.some((r) => r.typeName.toLowerCase().includes('bankruptcy'));
        }
        if (otherTxType === 'Mortgage Registration') {
          return p.mortgages.length > 0;
        }
        return (
          p.transactions.some((t) => t.type.toLowerCase() === otherTxType.toLowerCase()) ||
          p.restrictions.some((r) =>
            r.typeName.toLowerCase().includes(otherTxType.split(' ')[0].toLowerCase())
          )
        );
      })();

      if (!matchesOtherType) return false;
      if (!q) return true;
      if (/^\d+\/\d+\/\d+\/\d+\/\d+$/.test(q)) {
        return p.upi.toLowerCase() === q;
      }
      return (
        p.upi.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        p.transactionId.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q)
      );
    });

    const sorted = [...filtered];
    if (sortBy === 'area-desc') {
      sorted.sort((a, b) => b.sizeSqm - a.sizeSqm);
    } else if (sortBy === 'area-asc') {
      sorted.sort((a, b) => a.sizeSqm - b.sizeSqm);
    } else {
      sorted.sort((a, b) => a.upi.localeCompare(b.upi));
    }
    return sorted;
  }, [
    hasActiveSearch,
    parcels,
    activeTab,
    query,
    province,
    district,
    sector,
    cell,
    personSearchType,
    otherTxType,
    sortBy,
  ]);

  const selectedParcel = useMemo(() => {
    if (results.length === 0) return null;
    if (selectedUpi) {
      const match = results.find((r) => r.upi === selectedUpi);
      if (match) return match;
    }
    return results[0];
  }, [results, selectedUpi]);

  const activePersonMeta = PERSON_SEARCH_TYPES.find((t) => t.id === personSearchType)!;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#F4F7FA]">
      {/* Top Explorer Header with Contextual Tab Filters */}
      <div className="bg-white border-b border-slate-200/90 px-5 lg:px-7 pt-4 pb-4 shrink-0 space-y-3.5">
        {/* Title Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <div>
              <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                CADASTRAL REGISTRY EXPLORER
              </div>
              <h1 className="text-[17px] font-bold text-[#0F172A] leading-tight">
                Land Parcel Search
              </h1>
            </div>
          </div>

          <div className="text-xs text-slate-500 tabular-nums">
            {hasActiveSearch ? (
              <>
                <span className="font-bold text-[#0F172A]">{results.length}</span> of{' '}
                <span>{parcels.length}</span> parcels matched
              </>
            ) : (
              <span>{parcels.length} parcels indexed</span>
            )}
          </div>
        </div>

        {/* 4 Search Mode Tabs */}
        <div className="flex items-center border-b border-slate-100 -mx-1 overflow-x-auto">
          {[
            {
              id: 'upi' as const,
              label: 'Search by UPI / Location',
              icon: <MapPin className="w-3.5 h-3.5" />,
            },
            {
              id: 'applications' as const,
              label: 'Search Applications',
              icon: <FileText className="w-3.5 h-3.5" />,
            },
            {
              id: 'person' as const,
              label: 'Search by Person',
              icon: <User className="w-3.5 h-3.5" />,
            },
            {
              id: 'other' as const,
              label: 'Other Transactions',
              icon: <Repeat className="w-3.5 h-3.5" />,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setQuery('');
                  setSelectedUpi(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'border-[#0298D8] text-[#0298D8]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contextual Controls Based on Active Tab */}
        {activeTab === 'upi' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#0298D8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. 1/02/12/08/3356"
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-[#F8FAFC] text-[13px] text-[#0F172A] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0298D8] focus:ring-2 focus:ring-[#0298D8]/15 transition font-mono-code"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
                  aria-label="Clear search query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-slate-100" />
              <span className="text-[11px] font-medium text-slate-400">or narrow by location</span>
              <div className="flex-1 h-[1px] bg-slate-100" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Province */}
              <div className="relative">
                <select
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    setDistrict('');
                    setSector('');
                    setCell('');
                  }}
                  className="w-full h-10 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 appearance-none focus:outline-none focus:border-[#0298D8] cursor-pointer"
                >
                  <option value="">Province</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* District */}
              <div className="relative">
                <select
                  value={district}
                  disabled={!province}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    setSector('');
                    setCell('');
                  }}
                  className="w-full h-10 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 appearance-none focus:outline-none focus:border-[#0298D8] disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
                >
                  <option value="">District</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sector */}
              <div className="relative">
                <select
                  value={sector}
                  disabled={!district}
                  onChange={(e) => {
                    setSector(e.target.value);
                    setCell('');
                  }}
                  className="w-full h-10 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 appearance-none focus:outline-none focus:border-[#0298D8] disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
                >
                  <option value="">Sector</option>
                  {sectors.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Cell + Clear */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value={cell}
                    disabled={!sector}
                    onChange={(e) => setCell(e.target.value)}
                    className="w-full h-10 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 appearance-none focus:outline-none focus:border-[#0298D8] disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
                  >
                    <option value="">Cell</option>
                    {cells.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {province && (
                  <button
                    type="button"
                    onClick={clearLocationFilters}
                    title="Reset location filters"
                    className="h-10 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-[#0298D8] transition cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="relative">
            <Search className="w-4 h-4 text-[#0298D8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. APP-2024-04821 or TRX-2024-04821"
              className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-[#F8FAFC] text-[13px] text-[#0F172A] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0298D8] focus:ring-2 focus:ring-[#0298D8]/15 transition font-mono-code"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {activeTab === 'person' && (
          <div className="space-y-3">
            <div>
              <div className="text-[10.5px] font-bold tracking-wider uppercase text-slate-400 mb-2">
                SEARCH TYPE
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {PERSON_SEARCH_TYPES.map((item) => {
                  const isActive = personSearchType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setPersonSearchType(item.id);
                        setQuery('');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        isActive
                          ? 'bg-[#0895D8] border-[#0895D8] text-white shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-[10.5px] font-bold tracking-wider uppercase text-slate-400 mb-1.5">
                {activePersonMeta.label}
              </div>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={activePersonMeta.placeholder}
                  className="w-full h-11 pl-4 pr-20 rounded-xl border border-slate-200 bg-[#F8FAFC] text-[13px] text-[#0F172A] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0298D8] focus:ring-2 focus:ring-[#0298D8]/15 transition font-mono-code"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
                      aria-label="Clear search query"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <Search className="w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'other' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-7 relative">
              <select
                value={otherTxType}
                onChange={(e) => setOtherTxType(e.target.value as OtherTransactionType)}
                className={`w-full h-11 pl-4 pr-10 rounded-xl border border-slate-200 bg-white text-[13px] font-medium appearance-none focus:outline-none focus:border-[#0298D8] focus:ring-2 focus:ring-[#0298D8]/15 cursor-pointer ${
                  otherTxType ? 'text-[#0F172A]' : 'text-slate-400'
                }`}
              >
                <option value="">Select transaction type...</option>
                {OTHER_TRANSACTION_TYPES.map((txType) => (
                  <option key={txType} value={txType} className="text-[#0F172A]">
                    {txType}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Optional: filter by UPI, owner, or ref..."
                className="w-full h-11 pl-10 pr-9 rounded-xl border border-slate-200 bg-[#F8FAFC] text-[13px] text-[#0F172A] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0298D8] focus:ring-2 focus:ring-[#0298D8]/15 transition font-mono-code"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  aria-label="Clear search query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2-Zone Split-Pane Explorer: Results Stream + Quick-Peek Inspector */}
      <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden px-5 lg:px-7 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-full">
          {/* Zone 1: Results Stream (7 cols) */}
          <section className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] flex flex-col min-h-[360px] lg:min-h-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0F172A]">
                  {hasActiveSearch ? 'Matching Parcels' : 'Search Results'}
                </span>
                {hasActiveSearch ? (
                  <span className="px-2 py-0.5 rounded-full bg-[#EFF8FD] text-[#0284C7] text-[11px] font-bold tabular-nums">
                    {results.length}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold">
                    Awaiting search
                  </span>
                )}
              </div>

              {hasActiveSearch && results.length > 0 && (
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="h-8 pl-2.5 pr-7 rounded-lg border border-slate-200 bg-[#FCFDFE] text-[11px] font-semibold text-slate-600 appearance-none focus:outline-none focus:border-[#0298D8] cursor-pointer"
                  >
                    <option value="upi">Sort: UPI (A–Z)</option>
                    <option value="area-desc">Sort: Largest Area</option>
                    <option value="area-asc">Sort: Smallest Area</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>

            {!hasActiveSearch ? (
              <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
                {/* Centered guidance explaining what populates here */}
                <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-[#FCFDFE] px-6 py-8 text-center">
                  <div className="w-11 h-11 rounded-2xl bg-[#EFF8FD] text-[#0298D8] flex items-center justify-center mb-3">
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-[#0F172A]">
                    Search results will appear here
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 max-w-[360px] leading-relaxed">
                    {activeTab === 'upi' &&
                      'Enter a parcel UPI (e.g. 1/02/12/08/3356) or select a Province, District, Sector, or Cell above to list matching land parcels.'}
                    {activeTab === 'applications' &&
                      'Enter an application or transaction reference (e.g. APP-2024-04821 or TRX-2024-04821) above to display matching records.'}
                    {activeTab === 'person' &&
                      `Enter a ${activePersonMeta.label} above to list land parcels registered to that proprietor.`}
                    {activeTab === 'other' &&
                      'Select a transaction type or type a UPI, proprietor name, or reference above to list matching parcels.'}
                  </p>

                  {/* Wireframe preview rows indicating list layout */}
                  <div
                    aria-hidden="true"
                    className="w-full max-w-[440px] mt-6 space-y-2.5 text-left opacity-70"
                  >
                    {[0, 1, 2].map((row) => (
                      <div
                        key={row}
                        className="rounded-lg border border-slate-200/70 bg-white px-3.5 py-2.5 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-28 rounded bg-[#EFF8FD]" />
                            <div className="h-2.5 w-14 rounded-full bg-slate-100" />
                          </div>
                          <div className="h-2.5 w-44 rounded bg-slate-100" />
                          <div className="h-2 w-56 rounded bg-slate-100/80" />
                        </div>
                        <div className="w-5 h-5 rounded bg-slate-100 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {results.map((item) => {
                  const isSelected = selectedParcel?.upi === item.upi;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedUpi(item.upi)}
                      onDoubleClick={() => onSelectParcel(item.upi)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setSelectedUpi(item.upi);
                      }}
                      className={`px-4 py-3.5 transition cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#EFF8FD] border-l-[3px] border-l-[#0298D8]'
                          : 'hover:bg-[#F7FBFE] border-l-[3px] border-l-transparent'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono-code text-xs font-bold text-[#0284C7]">
                            {item.upi}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${
                              item.status === 'Returned' || item.status === 'Rejected'
                                ? 'bg-red-50 text-red-600'
                                : item.status === 'Approved' || item.status === 'Completed'
                                ? 'bg-[#E6F6FD] text-[#0284C7]'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.status}
                          </span>
                          {item.mortgages.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-semibold">
                              <Landmark className="w-2.5 h-2.5" />
                              Mortgaged
                            </span>
                          )}
                          {item.restrictions.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[10px] font-semibold">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Restricted
                            </span>
                          )}
                        </div>

                        <div className="text-[13px] font-semibold text-[#0F172A] mt-1 truncate">
                          {item.owner}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500 mt-1">
                          <span>
                            {item.province} · {item.district} / {item.sector} / {item.cell}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono-code">{item.sizeSqm.toFixed(1)} sqm</span>
                          <span className="text-slate-300">•</span>
                          <span>{item.landUse}</span>
                          <span className="text-slate-300">•</span>
                          <span>{item.source}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectParcel(item.upi);
                        }}
                        title="Open Parcel Workspace"
                        className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-[#0298D8] hover:bg-white transition cursor-pointer mt-0.5"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                  <Search className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-[#0F172A]">No matching parcels</div>
                <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                  No parcels matched your current search criteria. Try adjusting the filters or
                  clearing your query.
                </p>
                {(query || province || otherTxType) && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      clearLocationFilters();
                      setOtherTxType('');
                    }}
                    className="mt-4 px-3.5 py-1.5 rounded-lg bg-[#EFF8FD] text-[#0284C7] text-xs font-semibold hover:bg-[#E0F2FE] transition cursor-pointer"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Zone 2: Right Quick-Peek Inspector (5 cols) */}
          <aside className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] flex flex-col overflow-hidden">
            {selectedParcel ? (
              <>
                {/* Mini Cadastral Map Preview Header */}
                <div className="relative h-[140px] bg-slate-900 overflow-hidden shrink-0">
                  <img
                    src="/assets/aistudio/MapPlaceholder_1e5dad71.png"
                    alt={`Cadastral preview for ${selectedParcel.upi}`}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                  {/* Center Parcel Marker */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-9 h-9 rounded-full bg-[#38BDF8]/30 animate-ping" />
                      <div className="w-7 h-7 rounded-full bg-[#0298D8] border-2 border-white shadow-lg flex items-center justify-center text-white">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Overlay Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/70 backdrop-blur-md text-white text-[10.5px] font-mono-code border border-white/15">
                      <Compass className="w-3 h-3 text-[#38BDF8]" />
                      ITRF2005 · {selectedParcel.village}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/90 text-[#0F172A] text-[10.5px] font-bold shadow-2xs">
                      {selectedParcel.source}
                    </span>
                  </div>

                  {/* Overlay Bottom Title */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between gap-2">
                    <div>
                      <div className="font-mono-code text-sm font-bold text-white tracking-tight">
                        {selectedParcel.upi}
                      </div>
                      <div className="text-[11px] text-white/80">
                        {selectedParcel.province} · {selectedParcel.district} ·{' '}
                        {selectedParcel.sector}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inspector Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Owner & Tenure Card */}
                  <div className="rounded-xl border border-slate-200/80 bg-[#FCFDFE] p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                          Registered Proprietor
                        </div>
                        <div className="text-[13.5px] font-bold text-[#0F172A] mt-0.5">
                          {selectedParcel.owner}
                        </div>
                        <div className="font-mono-code text-[11px] text-slate-500 mt-0.5">
                          ID: {selectedParcel.nationalId}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#EFF8FD] text-[#0284C7] text-[11px] font-semibold shrink-0">
                        {selectedParcel.rightType}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-2.5 border-t border-slate-100 text-xs">
                      <div>
                        <div className="text-[10.5px] text-slate-400">Parcel Area</div>
                        <div className="font-mono-code font-bold text-[#0F172A] mt-0.5">
                          {selectedParcel.sizeSqm.toFixed(2)} sqm
                        </div>
                      </div>
                      <div>
                        <div className="text-[10.5px] text-slate-400">Land Use</div>
                        <div className="font-semibold text-[#0F172A] mt-0.5">
                          {selectedParcel.landUse}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10.5px] text-slate-400">Cell / Village</div>
                        <div className="font-medium text-slate-700 mt-0.5 truncate">
                          {selectedParcel.cell} / {selectedParcel.village}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10.5px] text-slate-400">Lease Term</div>
                        <div className="font-medium text-slate-700 mt-0.5">
                          {selectedParcel.leaseTerm}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metrics */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 text-center">
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        Mortgages
                      </div>
                      <div
                        className={`text-sm font-bold mt-0.5 tabular-nums ${
                          selectedParcel.mortgages.length > 0 ? 'text-amber-600' : 'text-[#0F172A]'
                        }`}
                      >
                        {selectedParcel.mortgages.length}
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 text-center">
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        Restrictions
                      </div>
                      <div
                        className={`text-sm font-bold mt-0.5 tabular-nums ${
                          selectedParcel.restrictions.length > 0
                            ? 'text-rose-600'
                            : 'text-[#0F172A]'
                        }`}
                      >
                        {selectedParcel.restrictions.length}
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 text-center">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Txns</div>
                      <div className="text-sm font-bold text-[#0F172A] mt-0.5 tabular-nums">
                        {selectedParcel.transactions.length}
                      </div>
                    </div>
                  </div>

                  {/* Latest Activity */}
                  {selectedParcel.transactions[0] && (
                    <div className="rounded-xl border border-slate-200/80 bg-[#FCFDFE] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                          Latest Transaction
                        </span>
                        <span className="text-[10.5px] font-semibold text-slate-500">
                          {selectedParcel.transactions[0].dateLabel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-1.5">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#0F172A] truncate">
                            {selectedParcel.transactions[0].type}
                          </div>
                          <div className="font-mono-code text-[11px] text-slate-400 truncate">
                            {selectedParcel.transactionId}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10.5px] font-semibold shrink-0">
                          {selectedParcel.transactions[0].status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sticky Inspector Footer Actions */}
                <div className="p-3.5 border-t border-slate-100 bg-[#FCFDFE] flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelectParcel(selectedParcel.upi)}
                    className="flex-1 h-10 rounded-xl bg-[#0298D8] hover:bg-[#0284C7] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Open Parcel Workspace</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onBookParcel(selectedParcel.upi)}
                    className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                    title="Book a new transaction on this parcel"
                  >
                    <BookPlus className="w-3.5 h-3.5 text-[#0298D8]" />
                    <span>Book</span>
                  </button>
                </div>
              </>
            ) : !hasActiveSearch ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Cadastral Map Placeholder Header */}
                <div className="h-[140px] border-b border-dashed border-slate-200 bg-[#F8FAFC] flex flex-col items-center justify-center gap-2 px-4 text-center shrink-0">
                  <div className="w-9 h-9 rounded-full bg-[#EFF8FD] text-[#0298D8] flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    Cadastral Map &amp; Parcel Preview
                  </div>
                </div>

                {/* Inspector Blueprint Body */}
                <div className="flex-1 p-4 flex flex-col justify-between gap-4 overflow-y-auto">
                  <div className="rounded-xl border border-dashed border-slate-200 bg-[#FCFDFE] p-4 text-center">
                    <div className="text-xs font-bold text-[#0F172A]">
                      Parcel details will appear here
                    </div>
                    <p className="text-[11.5px] text-slate-400 mt-1 leading-relaxed">
                      Once search results load, select any parcel to inspect its registered
                      proprietor, tenure, encumbrances, and actions.
                    </p>
                  </div>

                  <div aria-hidden="true" className="space-y-3 opacity-65">
                    <div className="rounded-xl border border-slate-200/70 bg-[#FCFDFE] p-3.5 space-y-2.5">
                      <div className="h-2.5 w-24 rounded bg-slate-100" />
                      <div className="h-3.5 w-44 rounded bg-slate-100" />
                      <div className="grid grid-cols-2 gap-2.5 pt-2.5 border-t border-slate-100">
                        <div className="h-6 rounded bg-slate-100/80" />
                        <div className="h-6 rounded bg-slate-100/80" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((tile) => (
                        <div
                          key={tile}
                          className="rounded-lg border border-slate-200/70 bg-white p-3 flex flex-col items-center gap-1.5"
                        >
                          <div className="h-2 w-12 rounded bg-slate-100" />
                          <div className="h-3.5 w-6 rounded bg-slate-100" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    aria-hidden="true"
                    className="pt-3 border-t border-slate-100 flex items-center gap-2 opacity-50"
                  >
                    <div className="flex-1 h-9 rounded-xl bg-slate-100" />
                    <div className="w-20 h-9 rounded-xl bg-slate-100" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400">
                No parcel selected. Adjust your search criteria to preview a parcel.
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};
