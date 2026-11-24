import React, { useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Eye,
  FileText,
  History,
  Lock,
  Map as MapIcon,
  MapPin,
  MessageSquare,
  Paperclip,
  Plus,
  Repeat,
  Search,
  Trash2,
  Upload,
  User,
  Users,
} from 'lucide-react';
import {
  AttachmentItem,
  CondoUnitRight,
  IntegrationSource,
  MortgageItem,
  ParcelRecord,
  ParcelTransaction,
  ProvinceName,
  TransactionStatus,
} from '../types/lais';
import {
  AddAttachmentModal,
  ParcelEditModal,
  PreviewModal,
  QuickActionModal,
  QuickActionType,
} from './Modals';
import { ParcelSatelliteMap } from './ParcelSatelliteMap';

interface ParcelWorkspaceViewProps {
  parcels: ParcelRecord[];
  activeUpi: string;
  onSelectUpi: (upi: string) => void;
  onBackToDashboard: () => void;
  onOpenSearch: () => void;
  onUpdateParcel: (upi: string, updater: (prev: ParcelRecord) => ParcelRecord) => void;
  onShowToast: (message: string) => void;
}

const PROVINCE_OPTIONS: Array<{ label: string; value: ProvinceName }> = [
  { label: 'SOUTHERN', value: 'Southern' },
  { label: 'WESTERN', value: 'Western' },
  { label: 'NORTHERN', value: 'Northern' },
  { label: 'EASTERN', value: 'Eastern' },
  { label: 'KIGALI CITY', value: 'Kigali City' },
  { label: 'NATIONAL', value: 'National' },
];

export const ParcelWorkspaceView: React.FC<ParcelWorkspaceViewProps> = ({
  parcels,
  activeUpi,
  onSelectUpi,
  onBackToDashboard,
  onOpenSearch,
  onUpdateParcel,
  onShowToast,
}) => {
  const activeParcel = useMemo(
    () => parcels.find((p) => p.upi === activeUpi) ?? parcels[0],
    [parcels, activeUpi]
  );

  // Left sidebar state
  const [leftSearch, setLeftSearch] = useState('');
  const [leftPage, setLeftPage] = useState(1);

  // Center column state
  const [infoTab, setInfoTab] = useState<'spatial' | 'condo'>('spatial');
  const [condoSubTab, setCondoSubTab] = useState<'rights' | 'previous'>('rights');
  const [selectedCondoRightId, setSelectedCondoRightId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Right column Transaction Section state
  const [txnProvince, setTxnProvince] = useState<ProvinceName>('Kigali City');
  const [provinceDropdownOpen, setProvinceDropdownOpen] = useState(false);
  const [txnSource, setTxnSource] = useState<'All Sources' | IntegrationSource>('All Sources');
  const [txnStatus, setTxnStatus] = useState<'All Status' | TransactionStatus>('All Status');
  const [txnTab, setTxnTab] = useState<'Transactions' | 'Company Txns' | 'Other Txns'>(
    'Transactions'
  );
  const [txnPage, setTxnPage] = useState(1);
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);

  // Comments & Children expansion
  const [commentText, setCommentText] = useState('');
  const [showAllChildren, setShowAllChildren] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [addAttachmentOpen, setAddAttachmentOpen] = useState(false);
  const [quickActionModal, setQuickActionModal] = useState<{
    action: QuickActionType;
    txn: ParcelTransaction;
  } | null>(null);
  const [previewState, setPreviewState] = useState<{
    title: string;
    subtitle: string;
    transaction?: ParcelTransaction | null;
    attachment?: AttachmentItem | null;
    mortgage?: MortgageItem | null;
  } | null>(null);
  const [parcelEditMode, setParcelEditMode] = useState<
    'book' | 'landUse' | 'rightType' | 'condoShow' | 'condoRep' | 'condoAddress' | null
  >(null);

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filtered left sidebar parcels
  const filteredLeftParcels = useMemo(() => {
    const q = leftSearch.trim().toLowerCase();
    if (!q) return parcels;
    return parcels.filter(
      (p) =>
        p.upi.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q)
    );
  }, [parcels, leftSearch]);

  const leftPageSize = 8;
  const totalLeftPages = Math.max(1, Math.ceil(filteredLeftParcels.length / leftPageSize));
  const safeLeftPage = Math.min(leftPage, totalLeftPages);
  const pagedLeftParcels = filteredLeftParcels.slice(
    (safeLeftPage - 1) * leftPageSize,
    safeLeftPage * leftPageSize
  );

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return activeParcel.transactions.filter((t) => {
      if (t.category !== txnTab) return false;
      if (txnSource !== 'All Sources' && t.source !== txnSource) return false;
      if (txnStatus !== 'All Status' && t.status !== txnStatus) return false;
      return true;
    });
  }, [activeParcel.transactions, txnTab, txnSource, txnStatus]);

  const txnPageSize = 5;
  const totalTxnPages = Math.max(1, Math.ceil(filteredTransactions.length / txnPageSize));
  const safeTxnPage = Math.min(txnPage, totalTxnPages);
  const pagedTransactions = filteredTransactions.slice(
    (safeTxnPage - 1) * txnPageSize,
    safeTxnPage * txnPageSize
  );

  const selectedTxn =
    activeParcel.transactions.find((t) => t.id === selectedTxnId) ?? null;

  const selectedCondoRight: CondoUnitRight | null =
    activeParcel.condoRights.find((r) => r.id === selectedCondoRightId) ??
    activeParcel.condoRights[0] ??
    null;

  const handleQuickActionConfirm = (
    action: QuickActionType,
    txn: ParcelTransaction,
    note: string
  ) => {
    const statusMap: Record<QuickActionType, TransactionStatus> = {
      Accept: 'Accepted',
      Process: 'Processed',
      Reverse: 'Returned',
      Reject: 'Rejected',
      Approve: 'Approved',
    };
    const historyMap: Record<
      QuickActionType,
      ParcelRecord['history'][number]['status']
    > = {
      Accept: 'ACCEPTED',
      Process: 'PROCESSED',
      Reverse: 'RETURNED',
      Reject: 'REJECTED',
      Approve: 'APPROVED',
    };

    const nextStatus = statusMap[action];
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const stamp = `${pad(now.getDate())}-${months[now.getMonth()]}-${now.getFullYear()}:${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    onUpdateParcel(activeParcel.upi, (prev) => ({
      ...prev,
      status: nextStatus === 'Printed' ? prev.status : nextStatus,
      transactions: prev.transactions.map((item) =>
        item.id === txn.id ? { ...item, status: nextStatus } : item
      ),
      history: [
        ...prev.history,
        {
          id: `h-${Date.now()}`,
          status: historyMap[action],
          user: 'emmanueliraturinze',
          startTimestamp: stamp,
        },
      ],
      comments: note
        ? [
            {
              id: `com-${Date.now()}`,
              initials: 'EI',
              avatarBg: '#0298D8',
              author: 'Emmanuel I.',
              role: 'Administrator',
              timestampLabel: 'Just now',
              body: `[${action}] ${note}`,
            },
            ...prev.comments,
          ]
        : prev.comments,
    }));

    onShowToast(`Transaction ${txn.type} marked as ${nextStatus}.`);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;
    onUpdateParcel(activeParcel.upi, (prev) => ({
      ...prev,
      comments: [
        {
          id: `com-${Date.now()}`,
          initials: 'EI',
          avatarBg: '#0298D8',
          author: 'Emmanuel I.',
          role: 'Administrator',
          timestampLabel: 'Just now',
          body: trimmed,
        },
        ...prev.comments,
      ],
    }));
    setCommentText('');
    onShowToast('Comment posted to transaction thread.');
  };

  const renderTxnStatusBadge = (status: TransactionStatus) => {
    if (status === 'Booked') {
      return <span className="text-[11px] font-semibold text-[#0298D8]">Booked</span>;
    }
    if (status === 'Returned' || status === 'Rejected') {
      return (
        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-600">
          {status}
        </span>
      );
    }
    if (
      status === 'Accepted' ||
      status === 'Completed' ||
      status === 'Printed' ||
      status === 'Approved'
    ) {
      return (
        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#E6F6FD] text-[#0284C7]">
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
        {status}
      </span>
    );
  };

  const renderHistoryBadge = (status: ParcelRecord['history'][number]['status']) => {
    if (status === 'RETURNED' || status === 'REJECTED') {
      return (
        <span className="inline-flex px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-bold tracking-wide">
          {status}
        </span>
      );
    }
    if (status === 'APPROVED' || status === 'ACCEPTED') {
      return (
        <span className="inline-flex px-2 py-0.5 rounded-md bg-[#E6F6FD] text-[#0284C7] text-[10px] font-bold tracking-wide">
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wide">
        {status}
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden bg-[#F4F7FA]">
      {/* ==================================================================== */}
      {/* LEFT SIDEBAR: Parcel Records (48)                                    */}
      {/* ==================================================================== */}
      <aside className="w-full lg:w-[228px] bg-white border-b lg:border-b-0 lg:border-r border-slate-200/90 flex flex-col shrink-0">
        <div className="p-3.5 border-b border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-bold text-[#0F172A]">Parcel Records</h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold">
              {filteredLeftParcels.length}
            </span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={leftSearch}
              onChange={(e) => {
                setLeftSearch(e.target.value);
                setLeftPage(1);
              }}
              placeholder="Search UPI or owner..."
              className="w-full h-8 pl-8 pr-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] text-xs text-[#0F172A] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0298D8]"
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {filteredLeftParcels.length === 0
              ? '0 parcels'
              : `${(safeLeftPage - 1) * leftPageSize + 1}–${Math.min(
                  safeLeftPage * leftPageSize,
                  filteredLeftParcels.length
                )} of ${filteredLeftParcels.length} parcels`}
          </div>
        </div>

        {/* Parcel List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[240px] lg:max-h-none">
          {pagedLeftParcels.map((p) => {
            const isSelected = p.upi === activeParcel.upi;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onSelectUpi(p.upi);
                  setSelectedTxnId(null);
                  setTxnPage(1);
                }}
                className={`w-full px-3 py-2.5 rounded-lg border text-left flex items-center justify-between transition cursor-pointer ${
                  isSelected
                    ? 'border-[#0298D8]/60 bg-[#F0F9FE] text-[#0284C7] shadow-2xs'
                    : 'border-slate-200/70 bg-white hover:border-slate-300 text-[#0F172A]'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-mono-code text-[12px] font-bold truncate">
                    {p.upi}
                  </div>
                  <div className="text-[10.5px] text-slate-400 truncate mt-0.5">
                    {p.owner}
                  </div>
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isSelected ? 'text-[#0298D8]' : 'text-slate-400'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Left Pagination */}
        <div className="p-2.5 border-t border-slate-100 flex items-center justify-center gap-1">
          <button
            type="button"
            disabled={safeLeftPage <= 1}
            onClick={() => setLeftPage((p) => Math.max(1, p - 1))}
            className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {Array.from({ length: totalLeftPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              type="button"
              onClick={() => setLeftPage(pg)}
              className={`w-7 h-7 rounded-md text-xs font-semibold transition cursor-pointer ${
                pg === safeLeftPage
                  ? 'bg-[#0298D8] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {pg}
            </button>
          ))}
          <button
            type="button"
            disabled={safeLeftPage >= totalLeftPages}
            onClick={() => setLeftPage((p) => Math.min(totalLeftPages, p + 1))}
            className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* CENTER WORKSPACE: Parcel Information, Map, Corrections, Condo, etc.  */}
      {/* ==================================================================== */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-4">
        {/* 1. Parcel Information Card (Images 5 & 15) */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#EFF8FD] text-[#0298D8] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h1 className="text-[15px] font-bold text-[#0F172A]">Parcel Information</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                {activeParcel.status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back to Dashboard
              </button>
              <button
                type="button"
                onClick={onOpenSearch}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0298D8] hover:bg-[#0284C7] text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                Search UPI
              </button>
            </div>
          </div>

          {/* Sub-tabs: Spatial Object | Condominium */}
          <div className="px-5 border-b border-slate-100 flex items-center gap-6">
            <button
              type="button"
              onClick={() => setInfoTab('spatial')}
              className={`py-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
                infoTab === 'spatial'
                  ? 'border-[#0298D8] text-[#0298D8]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Spatial Object
            </button>
            <button
              type="button"
              onClick={() => setInfoTab('condo')}
              className={`py-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
                infoTab === 'condo'
                  ? 'border-[#0298D8] text-[#0298D8]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Condominium
            </button>
          </div>

          {infoTab === 'spatial' ? (
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 pb-5 border-b border-slate-100">
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    UPI
                  </div>
                  <div className="font-mono-code text-[13px] font-semibold text-[#0F172A] mt-1">
                    {activeParcel.upi}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    PLANNED LAND USE
                  </div>
                  <div className="text-[13px] font-semibold text-[#0F172A] mt-1">
                    {activeParcel.plannedLandUse}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    LEASE TERM
                  </div>
                  <div className="text-[13px] font-semibold text-[#0F172A] mt-1">
                    {activeParcel.leaseTerm}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    LAND USE
                  </div>
                  <div className="text-[13px] font-semibold text-[#0F172A] mt-1">
                    {activeParcel.landUse}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    SIZE (SQM)
                  </div>
                  <div className="font-mono-code text-[13px] font-semibold text-[#0F172A] mt-1">
                    {activeParcel.sizeSqm.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    VILLAGE
                  </div>
                  <div className="text-[13px] font-semibold text-[#0F172A] mt-1">
                    {activeParcel.village}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    HAS CONDO UNITS
                  </div>
                  <div className="text-[13px] font-semibold text-[#0F172A] mt-1">
                    {activeParcel.hasCondoUnits ? 'True' : 'False'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    OWNER
                  </div>
                  <div className="text-[13px] font-semibold text-[#0F172A] mt-1">
                    {activeParcel.owner}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    RIGHT TYPE
                  </div>
                  <div className="text-[13px] font-semibold text-[#0F172A] mt-1">
                    {activeParcel.rightType}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    TRANSACTION ID
                  </div>
                  <div className="font-mono-code text-[13px] font-semibold text-[#0F172A] mt-1">
                    {activeParcel.transactionId}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setParcelEditMode('book')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0F172A] transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                  Book
                </button>
                <button
                  type="button"
                  onClick={() => setParcelEditMode('landUse')}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0F172A] transition cursor-pointer"
                >
                  Add Land Use
                </button>
                <button
                  type="button"
                  onClick={() => setParcelEditMode('rightType')}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0F172A] transition cursor-pointer"
                >
                  Add Right Type
                </button>
              </div>
            </div>
          ) : (
            /* Condominium Tab (Image 15) */
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5 pb-5 border-b border-slate-100">
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    UNIT UPI
                  </div>
                  <div className="font-mono-code text-[13px] font-semibold text-[#0F172A] mt-1">
                    {activeParcel.condoDetails.unitUpi}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    LAND USE
                  </div>
                  <div className="mt-1">
                    <span className="inline-flex px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                      {activeParcel.condoDetails.landUse}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    START DATE
                  </div>
                  <div className="font-mono-code text-[13px] font-semibold text-[#0F172A] mt-1">
                    {activeParcel.condoDetails.startDate}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    UNIT INDEX
                  </div>
                  <div className="font-mono-code text-[13px] font-semibold text-[#0F172A] mt-1">
                    {activeParcel.condoDetails.unitIndex}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    CONDO TYPE
                  </div>
                  <div className="mt-1">
                    <span className="inline-flex px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                      {activeParcel.condoDetails.condoType}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    START TRANSACTION ID
                  </div>
                  <div className="font-mono-code text-[13px] font-semibold text-[#0F172A] mt-1">
                    {activeParcel.condoDetails.startTransactionId}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    FLAT NO
                  </div>
                  <div className="font-mono-code text-[13px] font-semibold text-[#0F172A] mt-1">
                    {activeParcel.condoDetails.flatNo}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    UNIT AREA
                  </div>
                  <div className="font-mono-code text-[13px] font-semibold text-[#0F172A] mt-1">
                    {activeParcel.condoDetails.unitArea}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    END TRANSACTION ID
                  </div>
                  <div className="font-mono-code text-[13px] font-semibold text-[#0F172A] mt-1">
                    {activeParcel.condoDetails.endTransactionId}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    FLOOR NO
                  </div>
                  <div className="font-mono-code text-[13px] font-semibold text-[#0F172A] mt-1">
                    {activeParcel.condoDetails.floorNo}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    RIGHT TYPE
                  </div>
                  <div className="mt-1">
                    <span className="inline-flex px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                      {activeParcel.condoDetails.rightType}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    IS PROVISIONAL
                  </div>
                  <div className="mt-1">
                    <span className="inline-flex px-2.5 py-0.5 rounded-md bg-red-50 text-red-600 text-xs font-semibold">
                      {activeParcel.condoDetails.isProvisional}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setParcelEditMode('book')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0F172A] transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                  Book
                </button>
                <button
                  type="button"
                  onClick={() => setParcelEditMode('landUse')}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0F172A] transition cursor-pointer"
                >
                  Add Land Use
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 2. Parcel Location Map Card (Image 5) */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleCollapse('location')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <MapIcon className="w-4 h-4 text-[#0298D8]" />
              <h3 className="text-[14px] font-bold text-[#0F172A]">Parcel Location</h3>
            </div>
            {collapsed['location'] ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>
          {!collapsed['location'] && (
            <div className="px-5 pb-5">
              <ParcelSatelliteMap upi={activeParcel.upi} village={activeParcel.village} />
            </div>
          )}
        </section>

        {/* 3. Boundary Corrections Card (Image 2) */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleCollapse('boundary')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Repeat className="w-4 h-4 text-[#0298D8]" />
              <h3 className="text-[14px] font-bold text-[#0F172A]">Boundary Corrections</h3>
              <span className="w-5 h-5 rounded-full bg-[#0298D8] text-white text-[11px] font-bold flex items-center justify-center">
                {activeParcel.boundaryCorrections.length}
              </span>
            </div>
            {collapsed['boundary'] ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {!collapsed['boundary'] && (
            <div className="px-5 pb-5">
              <div className="rounded-xl border border-slate-200/90 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-slate-200/80 text-[10.5px] font-semibold tracking-wider text-slate-500 uppercase">
                      <th className="py-2.5 px-4">UPI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {activeParcel.boundaryCorrections.map((bc) => (
                      <tr
                        key={bc.id}
                        onClick={() => {
                          if (parcels.some((p) => p.upi === bc.upi)) {
                            onSelectUpi(bc.upi);
                          }
                        }}
                        className="hover:bg-slate-50 transition cursor-pointer"
                      >
                        <td className="py-3 px-4 font-mono-code font-medium text-[#0F172A]">
                          {bc.upi}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* 4. Condo Units Card (Image 2) */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleCollapse('condoUnits')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-[#0298D8]" />
              <h3 className="text-[14px] font-bold text-[#0F172A]">Condo Units</h3>
              <span className="w-5 h-5 rounded-full bg-[#0298D8] text-white text-[11px] font-bold flex items-center justify-center">
                {activeParcel.condoRights.length}
              </span>
            </div>
            {collapsed['condoUnits'] ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {!collapsed['condoUnits'] && (
            <div className="px-5 pb-5 space-y-3">
              {/* Sub-tabs */}
              <div className="border-b border-slate-100 flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => setCondoSubTab('rights')}
                  className={`py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
                    condoSubTab === 'rights'
                      ? 'border-[#0298D8] text-[#0298D8]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Rights ({activeParcel.condoRights.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCondoSubTab('previous')}
                  className={`py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
                    condoSubTab === 'previous'
                      ? 'border-[#0298D8] text-[#0298D8]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Previous Owners ({activeParcel.previousOwners.length})
                </button>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                <button
                  type="button"
                  onClick={() => setParcelEditMode('condoShow')}
                  className="inline-flex items-center gap-1.5 hover:text-[#0298D8] font-medium cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  Show
                </button>
                <button
                  type="button"
                  onClick={() => setParcelEditMode('condoRep')}
                  className="inline-flex items-center gap-1.5 hover:text-[#0298D8] font-medium cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Representative
                </button>
                <button
                  type="button"
                  onClick={() => setParcelEditMode('condoAddress')}
                  className="inline-flex items-center gap-1.5 hover:text-[#0298D8] font-medium cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Correct Address
                </button>
              </div>

              {/* Table */}
              <div className="rounded-xl border border-slate-200/90 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-slate-200/80 text-[10.5px] font-semibold tracking-wider text-slate-500 uppercase">
                      <th className="py-2.5 px-4">NAME</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {condoSubTab === 'rights' ? (
                      activeParcel.condoRights.map((right) => {
                        const isRowActive = selectedCondoRight?.id === right.id;
                        return (
                          <tr
                            key={right.id}
                            onClick={() => setSelectedCondoRightId(right.id)}
                            className={`transition cursor-pointer ${
                              isRowActive ? 'bg-[#F2FAFE]' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-3 px-4 font-medium text-[#0F172A] flex items-center justify-between">
                              <span>{right.name}</span>
                              {isRowActive && (
                                <span className="text-[11px] text-[#0284C7] font-semibold">
                                  {right.share}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="py-6 px-4 text-center text-slate-400">
                          No previous condominium owners recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* 5. Restrictions Card (Images 2, 4, 6) */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleCollapse('restrictions')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-[#0298D8]" />
              <h3 className="text-[14px] font-bold text-[#0F172A]">Restrictions</h3>
              <span className="w-5 h-5 rounded-full bg-[#0298D8] text-white text-[11px] font-bold flex items-center justify-center">
                {activeParcel.restrictions.length}
              </span>
            </div>
            {collapsed['restrictions'] ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {!collapsed['restrictions'] && (
            <div className="px-5 pb-5">
              <div className="rounded-xl border border-slate-200/90 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-slate-200/80 text-[10.5px] font-semibold tracking-wider text-slate-500 uppercase">
                      <th className="py-2.5 px-4">RESTRICTION TYPE NAME</th>
                      <th className="py-2.5 px-4">START DATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {activeParcel.restrictions.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-[#0F172A]">{r.typeName}</td>
                        <td className="py-3 px-4 font-mono-code text-slate-600">
                          {r.startDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* 6. Mortgages Card (Images 4, 6) */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleCollapse('mortgages')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Paperclip className="w-4 h-4 text-[#0298D8]" />
              <h3 className="text-[14px] font-bold text-[#0F172A]">Mortgages</h3>
              <span className="w-5 h-5 rounded-full bg-[#0298D8] text-white text-[11px] font-bold flex items-center justify-center">
                {activeParcel.mortgages.length}
              </span>
            </div>
            {collapsed['mortgages'] ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {!collapsed['mortgages'] && (
            <div className="px-5 pb-5">
              <div className="rounded-xl border border-slate-200/90 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-slate-200/80 text-[10.5px] font-semibold tracking-wider text-slate-500 uppercase">
                      <th className="py-2.5 px-4">REGISTRATION NO</th>
                      <th className="py-2.5 px-4">LOAN AMOUNT (RWF)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {activeParcel.mortgages.map((m) => (
                      <tr
                        key={m.id}
                        onClick={() =>
                          setPreviewState({
                            title: 'Mortgage Registration Details',
                            subtitle: `${m.registrationNo} · ${m.lender}`,
                            mortgage: m,
                          })
                        }
                        className="hover:bg-slate-50 transition cursor-pointer"
                      >
                        <td className="py-3 px-4 font-mono-code font-medium text-[#0298D8] hover:underline">
                          {m.registrationNo}
                        </td>
                        <td className="py-3 px-4 font-mono-code text-[#0F172A]">
                          {m.loanAmountRwf.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* 7. Object Annotations Card (Images 4, 6) */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleCollapse('annotations')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-[#0298D8]" />
              <h3 className="text-[14px] font-bold text-[#0F172A]">Object Annotations</h3>
              <span className="w-5 h-5 rounded-full bg-[#0298D8] text-white text-[11px] font-bold flex items-center justify-center">
                {activeParcel.annotations.length}
              </span>
            </div>
            {collapsed['annotations'] ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {!collapsed['annotations'] && (
            <div className="px-5 pb-5">
              <div className="rounded-xl border border-slate-200/90 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-slate-200/80 text-[10.5px] font-semibold tracking-wider text-slate-500 uppercase">
                      <th className="py-2.5 px-4">UPI</th>
                      <th className="py-2.5 px-4">ANNOTATION TEXT</th>
                      <th className="py-2.5 px-4">ANNOTATION TYPE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {activeParcel.annotations.map((ann) => (
                      <tr key={ann.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono-code font-medium text-[#0298D8] whitespace-nowrap">
                          {ann.upi}
                        </td>
                        <td className="py-3 px-4 text-[#0F172A]">{ann.text}</td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{ann.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ==================================================================== */}
      {/* RIGHT SIDEBAR: Transactions, Quick Actions, Attachments, Comments,   */}
      {/* Transaction History, Parents, Children, Boundary Corrections         */}
      {/* ==================================================================== */}
      <aside className="w-full lg:w-[340px] xl:w-[360px] overflow-y-auto p-4 lg:p-5 lg:pl-0 space-y-4 shrink-0">
        {/* 1. Transaction Section Card (Images 2, 4, 5, 6) */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-4 space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EFF8FD] text-[#0298D8] flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
            <h3 className="text-[14px] font-bold text-[#0F172A]">Transaction Section</h3>
          </div>

          {/* Province Dropdown (Image 4) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProvinceDropdownOpen((o) => !o)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-[#0F172A] flex items-center justify-between hover:border-slate-300 cursor-pointer"
            >
              <span>{txnProvince}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {provinceDropdownOpen && (
              <div className="absolute left-0 right-0 top-[40px] z-30 bg-white rounded-xl border border-slate-200 shadow-xl py-1 overflow-hidden">
                {PROVINCE_OPTIONS.map((opt) => {
                  const isCurrent = txnProvince === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setTxnProvince(opt.value);
                        setProvinceDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left text-xs font-medium tracking-wide transition cursor-pointer ${
                        isCurrent
                          ? 'bg-[#E6F1FD] text-[#0F172A] font-semibold border border-dashed border-[#60A5FA]'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Source & Status Filters */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="relative">
              <select
                value={txnSource}
                onChange={(e) => {
                  setTxnSource(e.target.value as typeof txnSource);
                  setTxnPage(1);
                }}
                className="w-full h-9 pl-3 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-medium text-[#0F172A] appearance-none cursor-pointer"
              >
                <option value="All Sources">All Sources</option>
                <option value="LAIS">LAIS</option>
                <option value="IREMBO">IREMBO</option>
                <option value="IECMS">IECMS</option>
                <option value="BPMIS">BPMIS</option>
                <option value="Ubutaka">Ubutaka</option>
                <option value="IFMIS">IFMIS</option>
                <option value="RDB">RDB</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={txnStatus}
                onChange={(e) => {
                  setTxnStatus(e.target.value as typeof txnStatus);
                  setTxnPage(1);
                }}
                className="w-full h-9 pl-3 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-medium text-[#0F172A] appearance-none cursor-pointer"
              >
                <option value="All Status">All Status</option>
                <option value="Processing">Processing</option>
                <option value="Accepted">Accepted</option>
                <option value="Completed">Completed</option>
                <option value="Booked">Booked</option>
                <option value="Printed">Printed</option>
                <option value="Approved">Approved</option>
                <option value="Returned">Returned</option>
                <option value="Rejected">Rejected</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* QUICK ACTIONS Panel when a transaction row is selected (Image 6) */}
          {selectedTxn && (
            <div className="pt-1 pb-1 space-y-2">
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                QUICK ACTIONS
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['Accept', 'Process'] as const).map((act) => (
                  <button
                    key={act}
                    type="button"
                    onClick={() => setQuickActionModal({ action: act, txn: selectedTxn })}
                    className="h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0F172A] transition cursor-pointer"
                  >
                    {act}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setCollapsed((prev) => ({ ...prev, comments: false }));
                    setTimeout(() => {
                      commentInputRef.current?.focus();
                      commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 50);
                  }}
                  className="h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0F172A] transition cursor-pointer"
                >
                  Comment
                </button>
                <button
                  type="button"
                  onClick={() => setQuickActionModal({ action: 'Reverse', txn: selectedTxn })}
                  className="h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0F172A] transition cursor-pointer"
                >
                  Reverse
                </button>
                <button
                  type="button"
                  onClick={() => setQuickActionModal({ action: 'Reject', txn: selectedTxn })}
                  className="h-8 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-xs font-semibold text-red-600 transition cursor-pointer"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => setQuickActionModal({ action: 'Approve', txn: selectedTxn })}
                  className="h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0F172A] transition cursor-pointer"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewState({
                      title: 'Transaction Summary Preview',
                      subtitle: `${selectedTxn.type} · ${selectedTxn.reference}`,
                      transaction: selectedTxn,
                    })
                  }
                  className="h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0F172A] transition cursor-pointer"
                >
                  Preview
                </button>
              </div>
            </div>
          )}

          {/* Transaction Tabs */}
          <div className="border-b border-slate-100 flex items-center justify-between text-xs">
            {(['Transactions', 'Company Txns', 'Other Txns'] as const).map((tab) => {
              const isActive = txnTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setTxnTab(tab);
                    setTxnPage(1);
                    setSelectedTxnId(null);
                  }}
                  className={`py-2.5 px-1 font-semibold border-b-2 transition cursor-pointer ${
                    isActive
                      ? 'border-[#0298D8] text-[#0298D8]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Transaction List Table */}
          <div className="rounded-xl border border-slate-200/80 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200/80 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  <th className="py-2 px-3">DATE</th>
                  <th className="py-2 px-2">TRANSACTION</th>
                  <th className="py-2 px-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {pagedTransactions.map((t) => {
                  const isRowSelected = selectedTxnId === t.id;
                  return (
                    <tr
                      key={t.id}
                      onClick={() =>
                        setSelectedTxnId((prev) => (prev === t.id ? null : t.id))
                      }
                      className={`transition cursor-pointer ${
                        isRowSelected
                          ? 'bg-[#EBF6FD] border-l-2 border-l-[#0298D8]'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-3 align-top">
                        <div className="text-[11.5px] font-medium text-[#0F172A]">
                          {t.dateLabel}
                        </div>
                        <div className="font-mono-code text-[10px] text-slate-400 mt-0.5">
                          {t.reference}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 align-middle font-medium text-[#0F172A]">
                        {t.type}
                      </td>
                      <td className="py-2.5 px-3 align-middle text-right">
                        {renderTxnStatusBadge(t.status)}
                      </td>
                    </tr>
                  );
                })}
                {pagedTransactions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-xs text-slate-400">
                      No transactions match filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Transaction Pagination */}
          <div className="flex items-center justify-between pt-0.5 text-[11px] text-slate-400">
            <span>
              Showing{' '}
              {filteredTransactions.length === 0
                ? 0
                : (safeTxnPage - 1) * txnPageSize + 1}
              –{Math.min(safeTxnPage * txnPageSize, filteredTransactions.length)} of{' '}
              {filteredTransactions.length} transactions
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalTxnPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  type="button"
                  onClick={() => setTxnPage(pg)}
                  className={`w-6 h-6 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                    pg === safeTxnPage
                      ? 'bg-[#0298D8] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pg}
                </button>
              ))}
              <button
                type="button"
                disabled={safeTxnPage >= totalTxnPages}
                onClick={() => setTxnPage((p) => Math.min(totalTxnPages, p + 1))}
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </section>

        {/* 2. Attachments Card (Images 2, 11, 13) */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleCollapse('attachments')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Paperclip className="w-4 h-4 text-[#0298D8]" />
              <h3 className="text-[14px] font-bold text-[#0F172A]">Attachments</h3>
              <span className="w-5 h-5 rounded-full bg-[#0298D8] text-white text-[11px] font-bold flex items-center justify-center">
                {activeParcel.attachments.length}
              </span>
            </div>
            {collapsed['attachments'] ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {!collapsed['attachments'] && (
            <div className="px-4 pb-4 space-y-2.5">
              {activeParcel.attachments.map((att) => {
                const badgeStyle =
                  att.fileType === 'PDF'
                    ? 'bg-red-50 text-red-500 border-red-100'
                    : att.fileType === 'IMG'
                    ? 'bg-sky-50 text-sky-600 border-sky-100'
                    : 'bg-blue-50 text-blue-600 border-blue-100';

                return (
                  <div
                    key={att.id}
                    className="group flex items-center justify-between gap-2.5 p-2.5 rounded-xl border border-slate-200/80 bg-[#F9FBFD] hover:bg-white hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-8 h-8 rounded-lg border text-[10px] font-bold flex items-center justify-center shrink-0 ${badgeStyle}`}
                      >
                        {att.fileType}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#0F172A] truncate">
                          {att.fileName}
                        </div>
                        <div className="text-[10.5px] text-slate-400 mt-0.5">
                          {att.sizeLabel} · {att.dateLabel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="Preview attachment"
                        onClick={() =>
                          setPreviewState({
                            title: 'Attachment Preview',
                            subtitle: att.fileName,
                            attachment: att,
                          })
                        }
                        className="w-7 h-7 rounded-lg bg-[#EFF8FD] text-[#0298D8] hover:bg-[#E0F2FE] flex items-center justify-center opacity-90 group-hover:opacity-100 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Download"
                        onClick={() => onShowToast(`Downloading ${att.fileName}...`)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Remove attachment"
                        onClick={() => {
                          onUpdateParcel(activeParcel.upi, (prev) => ({
                            ...prev,
                            attachments: prev.attachments.filter((a) => a.id !== att.id),
                          }));
                          onShowToast(`Removed ${att.fileName}`);
                        }}
                        className="w-7 h-7 rounded-lg bg-red-50/70 text-red-500 hover:bg-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setAddAttachmentOpen(true)}
                className="w-full h-9 rounded-xl border border-dashed border-sky-300 bg-[#F4FBFF] hover:bg-[#E8F6FD] text-[#0298D8] text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Attachment
              </button>
            </div>
          )}
        </section>

        {/* 3. Transaction Comments Card (Images 10, 11) */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleCollapse('comments')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-[#0298D8]" />
              <h3 className="text-[14px] font-bold text-[#0F172A]">Transaction Comments</h3>
              <span className="w-5 h-5 rounded-full bg-[#0298D8] text-white text-[11px] font-bold flex items-center justify-center">
                {activeParcel.comments.length}
              </span>
            </div>
            {collapsed['comments'] ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {!collapsed['comments'] && (
            <div className="px-4 pb-4 space-y-3.5">
              <div className="space-y-3.5 max-h-[260px] overflow-y-auto pr-1">
                {activeParcel.comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: c.avatarBg }}
                    >
                      {c.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs truncate">
                          <span className="font-bold text-[#0F172A]">{c.author}</span>{' '}
                          <span className="text-[11px] text-slate-400">{c.role}</span>
                        </div>
                        <span className="text-[10.5px] text-slate-400 shrink-0">
                          {c.timestampLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 h-9 px-3 rounded-lg border border-slate-200 bg-[#F8FAFC] text-xs text-[#0F172A] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0298D8]"
                />
                <button
                  type="submit"
                  className="h-9 px-3.5 rounded-lg bg-[#0298D8] hover:bg-[#0284C7] text-white text-xs font-semibold transition cursor-pointer"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </section>

        {/* 4. Transaction History Card (Images 10, 12) */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleCollapse('history')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-[#0298D8]" />
              <h3 className="text-[14px] font-bold text-[#0F172A]">Transaction History</h3>
              <span className="w-5 h-5 rounded-full bg-[#0298D8] text-white text-[11px] font-bold flex items-center justify-center">
                {activeParcel.history.length}
              </span>
            </div>
            {collapsed['history'] ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {!collapsed['history'] && (
            <div className="px-4 pb-4">
              <div className="overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                      <th className="py-2 pr-2">STATUS</th>
                      <th className="py-2 px-2">USER</th>
                      <th className="py-2 pl-2">START TIMESTAMP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11.5px]">
                    {activeParcel.history.map((h) => (
                      <tr key={h.id}>
                        <td className="py-2.5 pr-2 align-top">{renderHistoryBadge(h.status)}</td>
                        <td className="py-2.5 px-2 align-top text-slate-700 font-medium break-all">
                          {h.user}
                        </td>
                        <td className="py-2.5 pl-2 align-top font-mono-code text-[10.5px] text-slate-500">
                          {h.startTimestamp}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* 5. Parents Card (Images 12, 14) */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleCollapse('parents')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-[#0298D8]" />
              <h3 className="text-[14px] font-bold text-[#0F172A]">Parents</h3>
              <span className="w-5 h-5 rounded-full bg-[#0298D8] text-white text-[11px] font-bold flex items-center justify-center">
                {activeParcel.parents.length}
              </span>
            </div>
            {collapsed['parents'] ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {!collapsed['parents'] && (
            <div className="px-4 pb-4 space-y-2">
              {activeParcel.parents.map((par) => (
                <button
                  key={par.upi}
                  type="button"
                  onClick={() => {
                    if (parcels.some((p) => p.upi === par.upi)) {
                      onSelectUpi(par.upi);
                    } else {
                      onShowToast(`Navigated to parent parcel ${par.upi}`);
                    }
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200/80 hover:border-[#0298D8]/50 bg-[#F9FBFD] text-left transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-code text-xs font-bold text-[#0298D8]">
                      {par.upi}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10.5px] font-semibold">
                      {par.status}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-[#0F172A] mt-1">{par.owner}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {par.areaSqm.toLocaleString()} sqm · {par.district} · {par.note}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 6. Children Card (Images 12, 14) */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleCollapse('children')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-[#0298D8]" />
              <h3 className="text-[14px] font-bold text-[#0F172A]">Children</h3>
              <span className="px-2 py-0.5 rounded-full bg-[#0298D8] text-white text-[11px] font-bold">
                {activeParcel.children.length}
              </span>
            </div>
            {collapsed['children'] ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {!collapsed['children'] && (
            <div className="px-4 pb-4 space-y-2">
              {(showAllChildren
                ? activeParcel.children
                : activeParcel.children.slice(0, 5)
              ).map((child) => (
                <div
                  key={child.upi}
                  onClick={() => onShowToast(`Selected child parcel ${child.upi} (${child.owner})`)}
                  className="p-3 rounded-xl border border-slate-200/80 hover:border-[#0298D8]/50 bg-[#F9FBFD] transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-code text-xs font-bold text-[#0298D8]">
                      {child.upi}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${
                        child.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {child.status}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-slate-600 mt-1">
                    {child.owner} · {child.areaSqm} sqm
                  </div>
                </div>
              ))}

              {activeParcel.children.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllChildren((s) => !s)}
                  className="w-full pt-1 text-center text-[11px] text-slate-400 hover:text-[#0298D8] font-medium cursor-pointer"
                >
                  {showAllChildren
                    ? 'Show fewer children'
                    : `Showing 5 of ${activeParcel.children.length} children`}
                </button>
              )}
            </div>
          )}
        </section>

        {/* 7. Boundary Corrections Sidebar Card (Image 14) */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleCollapse('rightBoundary')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded border border-sky-200 text-[#0298D8] flex items-center justify-center text-[10px] font-bold">
                ⊞
              </div>
              <h3 className="text-[14px] font-bold text-[#0F172A]">Boundary Corrections</h3>
              <span className="w-5 h-5 rounded-full bg-[#0298D8] text-white text-[11px] font-bold flex items-center justify-center">
                {activeParcel.boundaryCorrections.length}
              </span>
            </div>
            {collapsed['rightBoundary'] ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {!collapsed['rightBoundary'] && (
            <div className="px-4 pb-4 space-y-2">
              {activeParcel.boundaryCorrections.map((bc, idx) => (
                <div
                  key={bc.id}
                  className="p-3 rounded-xl border border-slate-200/80 bg-[#F9FBFD]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-code text-xs font-bold text-[#0298D8]">
                      {idx === 0 ? 'BC-2022-0041' : 'BC-2023-0118'}
                    </span>
                    <span className="text-[11px] text-slate-400">{bc.date}</span>
                  </div>
                  <div className="text-xs text-slate-700 mt-1">{bc.title}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </aside>

      {/* ==================================================================== */}
      {/* MODALS                                                               */}
      {/* ==================================================================== */}
      {addAttachmentOpen && (
        <AddAttachmentModal
          onClose={() => setAddAttachmentOpen(false)}
          onUpload={(att) => {
            onUpdateParcel(activeParcel.upi, (prev) => ({
              ...prev,
              attachments: [att, ...prev.attachments],
            }));
            onShowToast(`Uploaded ${att.fileName}`);
          }}
        />
      )}

      {quickActionModal && (
        <QuickActionModal
          action={quickActionModal.action}
          transaction={quickActionModal.txn}
          onClose={() => setQuickActionModal(null)}
          onConfirm={(note) =>
            handleQuickActionConfirm(quickActionModal.action, quickActionModal.txn, note)
          }
        />
      )}

      {previewState && (
        <PreviewModal
          title={previewState.title}
          subtitle={previewState.subtitle}
          parcel={activeParcel}
          transaction={previewState.transaction}
          attachment={previewState.attachment}
          mortgage={previewState.mortgage}
          onClose={() => setPreviewState(null)}
        />
      )}

      {parcelEditMode && (
        <ParcelEditModal
          mode={parcelEditMode}
          parcel={activeParcel}
          selectedRight={selectedCondoRight}
          onClose={() => setParcelEditMode(null)}
          onSaveBook={(txnType, applicant) => {
            const newTxn: ParcelTransaction = {
              id: `tx-${Date.now()}`,
              dateLabel: 'Nov 24,',
              reference: activeParcel.upi,
              type: txnType,
              category: 'Transactions',
              status: 'Booked',
              source: 'LAIS',
              province: activeParcel.province,
              applicant,
            };
            onUpdateParcel(activeParcel.upi, (prev) => ({
              ...prev,
              transactions: [newTxn, ...prev.transactions],
            }));
            onShowToast(`Booked ${txnType} on ${activeParcel.upi}`);
          }}
          onSaveLandUse={(landUse, plannedLandUse) => {
            onUpdateParcel(activeParcel.upi, (prev) => ({
              ...prev,
              landUse,
              plannedLandUse,
            }));
            onShowToast(`Updated Land Use to ${landUse}`);
          }}
          onSaveRightType={(rightType) => {
            onUpdateParcel(activeParcel.upi, (prev) => ({
              ...prev,
              rightType,
            }));
            onShowToast(`Updated Right Type to ${rightType}`);
          }}
          onSaveCondoAddress={(rightId, newAddress, newRep) => {
            onUpdateParcel(activeParcel.upi, (prev) => ({
              ...prev,
              condoRights: prev.condoRights.map((r) =>
                r.id === rightId
                  ? { ...r, address: newAddress, representative: newRep }
                  : r
              ),
            }));
            onShowToast('Condominium rights holder updated.');
          }}
        />
      )}
    </div>
  );
};
