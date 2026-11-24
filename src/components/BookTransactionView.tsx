import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookPlus,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  FileText,
  Layers,
  MapPin,
  Phone,
  Plus,
  RotateCcw,
  Trash2,
  User,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { IntegrationSource, ParcelRecord } from '../types/lais';

interface BookTransactionViewProps {
  parcels: ParcelRecord[];
  initialUpi?: string | null;
  onBack: () => void;
  onBookSuccess: (payload: {
    reference: string;
    dateReceived: string;
    transactionType: string;
    source: IntegrationSource;
    upis: string[];
    applicantName: string;
    idType: 'National ID' | 'Passport' | 'TIN';
    idNumber: string;
    phone: string;
    country: string;
    district: string;
    notes: string;
  }) => void;
  onOpenParcel: (upi: string) => void;
}

interface ConnectedUpiItem {
  upi: string;
  owner: string;
  district: string;
  areaSqm: number | null;
  knownParcel: boolean;
}

const TRANSACTION_TYPES = [
  'Sale & Transfer',
  'Subdivision',
  'Amalgamation',
  'Mortgage Registration',
  'Succession / Inheritance',
  'Donation',
  'Boundary Rectification',
  'Lease Renewal',
  'Condominium Registration',
  'Correction of Title',
];

const CHANNELS: Array<{
  id: Extract<IntegrationSource, 'LAIS' | 'IREMBO' | 'IECMS'>;
  label: string;
  subtitle: string;
}> = [
  { id: 'LAIS', label: 'LAIS', subtitle: 'Direct desk intake' },
  { id: 'IREMBO', label: 'IREMBO', subtitle: 'Citizen e-portal' },
  { id: 'IECMS', label: 'IECMS', subtitle: 'Court integration' },
];

const ID_TYPES: Array<{
  id: 'National ID' | 'Passport' | 'TIN';
  placeholder: string;
}> = [
  { id: 'National ID', placeholder: '1 1990 8 0012345 0 12' },
  { id: 'Passport', placeholder: 'PC 1234567' },
  { id: 'TIN', placeholder: '100 234 567' },
];

const COUNTRIES = ['RWANDA', 'KENYA', 'UGANDA', 'TANZANIA', 'BURUNDI', 'DRC', 'OTHER'];

const DISTRICTS = [
  'NYARUGENGE',
  'GASABO',
  'KICUKIRO',
  'HUYE',
  'MUHANGA',
  'RUBAVU',
  'RUSIZI',
  'MUSANZE',
  'RWAMAGANA',
  'KAYONZA',
  'BUGESERA',
];

export const BookTransactionView: React.FC<BookTransactionViewProps> = ({
  parcels,
  initialUpi = null,
  onBack,
  onBookSuccess,
  onOpenParcel,
}) => {
  const [dateReceived, setDateReceived] = useState('2026-09-21');
  const [transactionType, setTransactionType] = useState('');
  const [submittedThrough, setSubmittedThrough] = useState<'LAIS' | 'IREMBO' | 'IECMS'>('LAIS');

  const [upiInput, setUpiInput] = useState('');
  const [upiFocused, setUpiFocused] = useState(false);
  const [connectedUpis, setConnectedUpis] = useState<ConnectedUpiItem[]>(() => {
    if (!initialUpi) return [];
    const found = parcels.find((p) => p.upi.toLowerCase() === initialUpi.toLowerCase());
    if (!found) {
      return [
        {
          upi: initialUpi,
          owner: 'Pending registry lookup',
          district: 'External UPI',
          areaSqm: null,
          knownParcel: false,
        },
      ];
    }
    return [
      {
        upi: found.upi,
        owner: found.owner,
        district: `${found.district} · ${found.sector}`,
        areaSqm: found.sizeSqm,
        knownParcel: true,
      },
    ];
  });
  const [selectedUpiRow, setSelectedUpiRow] = useState<string | null>(initialUpi);

  const [idType, setIdType] = useState<'National ID' | 'Passport' | 'TIN'>('National ID');
  const [idNumber, setIdNumber] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [country, setCountry] = useState('RWANDA');
  const [district, setDistrict] = useState('NYARUGENGE');
  const [notes, setNotes] = useState('');

  const [formError, setFormError] = useState('');
  const [bookedSummary, setBookedSummary] = useState<{
    reference: string;
    transactionType: string;
    source: IntegrationSource;
    dateReceived: string;
    upis: ConnectedUpiItem[];
    applicantName: string;
    district: string;
  } | null>(null);

  // Live UPI autocomplete suggestions
  const upiSuggestions = useMemo(() => {
    const q = upiInput.trim().toLowerCase();
    const alreadyAdded = new Set(connectedUpis.map((u) => u.upi));
    return parcels
      .filter(
        (p) =>
          !alreadyAdded.has(p.upi) &&
          (q === '' ||
            p.upi.toLowerCase().includes(q) ||
            p.owner.toLowerCase().includes(q) ||
            p.district.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [upiInput, parcels, connectedUpis]);

  const addUpi = (rawValue?: string) => {
    const clean = (rawValue ?? upiInput).trim();
    if (!clean) return;
    if (connectedUpis.some((u) => u.upi.toLowerCase() === clean.toLowerCase())) {
      setFormError(`UPI ${clean} is already connected to this transaction.`);
      return;
    }

    const match = parcels.find((p) => p.upi.toLowerCase() === clean.toLowerCase());
    const newItem: ConnectedUpiItem = match
      ? {
          upi: match.upi,
          owner: match.owner,
          district: match.district,
          areaSqm: match.sizeSqm,
          knownParcel: true,
        }
      : {
          upi: clean,
          owner: 'Unregistered / External',
          district: district,
          areaSqm: null,
          knownParcel: false,
        };

    setConnectedUpis((prev) => [...prev, newItem]);
    setSelectedUpiRow(newItem.upi);
    setUpiInput('');
    setUpiFocused(false);
    setFormError('');

    // Auto-hint district if matched
    if (match && DISTRICTS.includes(match.district.toUpperCase())) {
      setDistrict(match.district.toUpperCase());
    }
  };

  const removeSelectedUpi = () => {
    if (!selectedUpiRow) return;
    setConnectedUpis((prev) => prev.filter((u) => u.upi !== selectedUpiRow));
    setSelectedUpiRow(null);
  };

  const removeSingleUpi = (upi: string) => {
    setConnectedUpis((prev) => prev.filter((u) => u.upi !== upi));
    if (selectedUpiRow === upi) setSelectedUpiRow(null);
  };

  const handleFillFromOwner = () => {
    const firstKnown = connectedUpis.find((u) => u.knownParcel);
    if (!firstKnown) return;
    const match = parcels.find((p) => p.upi === firstKnown.upi);
    if (!match) return;
    setApplicantName(match.owner);
    setIdType('National ID');
    setIdNumber(match.nationalId);
    setPhoneNo('788 412 905');
    if (DISTRICTS.includes(match.district.toUpperCase())) {
      setDistrict(match.district.toUpperCase());
    }
    setFormError('');
  };

  const handleReset = () => {
    setDateReceived('2026-09-21');
    setTransactionType('');
    setSubmittedThrough('LAIS');
    setUpiInput('');
    setConnectedUpis([]);
    setSelectedUpiRow(null);
    setIdType('National ID');
    setIdNumber('');
    setApplicantName('');
    setPhoneNo('');
    setCountry('RWANDA');
    setDistrict('NYARUGENGE');
    setNotes('');
    setFormError('');
  };

  const hasDetails = Boolean(dateReceived && transactionType);
  const hasUpis = connectedUpis.length > 0;
  const hasContact = Boolean(idNumber.trim() && applicantName.trim() && phoneNo.trim());
  const isReadyToBook = hasDetails && hasUpis && hasContact;

  const totalAreaSqm = useMemo(
    () => connectedUpis.reduce((sum, u) => sum + (u.areaSqm ?? 0), 0),
    [connectedUpis]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionType) {
      setFormError('Please select a Type of Transaction before booking.');
      return;
    }
    if (connectedUpis.length === 0) {
      setFormError('Please add at least one UPI connected to the transaction.');
      return;
    }
    if (!idNumber.trim() || !applicantName.trim() || !phoneNo.trim()) {
      setFormError('Please complete Identification No, Name of Applicant, and Phone No.');
      return;
    }

    setFormError('');
    const reference = `TRX-2026-${String(Math.floor(50000 + Math.random() * 49000))}`;
    onBookSuccess({
      reference,
      dateReceived,
      transactionType,
      source: submittedThrough,
      upis: connectedUpis.map((u) => u.upi),
      applicantName: applicantName.trim(),
      idType,
      idNumber: idNumber.trim(),
      phone: phoneNo.trim(),
      country,
      district,
      notes: notes.trim(),
    });

    setBookedSummary({
      reference,
      transactionType,
      source: submittedThrough,
      dateReceived,
      upis: connectedUpis,
      applicantName: applicantName.trim(),
      district,
    });
  };

  const activeIdPlaceholder =
    ID_TYPES.find((t) => t.id === idType)?.placeholder ?? 'Enter identification number';

  return (
    <div className="flex-1 overflow-y-auto px-5 lg:px-8 py-5 bg-[#F4F7FA]">
      <div className="max-w-[1140px] mx-auto space-y-5">
        {/* Top Action & Title Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-600 shadow-2xs transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <div>
              <h1 className="text-[18px] font-bold text-[#0F172A] tracking-tight">
                Book New Transaction
              </h1>
              <p className="text-xs text-slate-400">
                Register an incoming land application and link target UPIs
              </p>
            </div>
          </div>

        </div>

        <AnimatePresence mode="wait">
          {bookedSummary ? (
            /* Confirmation View */
            <motion.div
              key="booked-confirmation"
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[660px] mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-[0_12px_36px_rgba(15,23,42,0.06)] overflow-hidden mt-4"
            >
              <div className="px-6 py-6 bg-gradient-to-br from-[#F0F9FF] to-white border-b border-slate-100 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#0298D8] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[17px] font-bold text-[#0F172A]">
                      Transaction Booked Successfully
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                      BOOKED
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Reference{' '}
                    <span className="font-mono-code font-semibold text-[#0284C7]">
                      {bookedSummary.reference}
                    </span>{' '}
                    has been registered via {bookedSummary.source}.
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">
                      Transaction Type
                    </div>
                    <div className="font-semibold text-[#0F172A] mt-0.5">
                      {bookedSummary.transactionType}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">
                      Date Received
                    </div>
                    <div className="font-mono-code font-semibold text-[#0F172A] mt-0.5">
                      {bookedSummary.dateReceived}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">
                      Applicant
                    </div>
                    <div className="font-semibold text-[#0F172A] mt-0.5">
                      {bookedSummary.applicantName}
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10.5px] font-bold tracking-wider uppercase text-slate-500">
                    Linked Parcels ({bookedSummary.upis.length})
                  </div>
                  <div className="divide-y divide-slate-100">
                    {bookedSummary.upis.map((item) => (
                      <div
                        key={item.upi}
                        className="px-4 py-2.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono-code font-semibold text-[#0284C7]">
                            {item.upi}
                          </span>
                          <span className="text-slate-400 mx-2">·</span>
                          <span className="text-slate-700 font-medium">{item.owner}</span>
                        </div>
                        {item.knownParcel && (
                          <button
                            type="button"
                            onClick={() => onOpenParcel(item.upi)}
                            className="text-xs font-semibold text-[#0298D8] hover:underline cursor-pointer"
                          >
                            Open Parcel →
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={onBack}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Back to Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBookedSummary(null);
                      handleReset();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0298D8] hover:bg-[#0284C7] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <BookPlus className="w-3.5 h-3.5" />
                    Book Another Transaction
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Main 2-Column Form + Live Summary */
            <motion.form
              key="book-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
            >
              {/* Left Column: 3 Form Cards */}
              <div className="lg:col-span-8 space-y-5">
                {/* 1. Transaction Details */}
                <section className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#EFF8FD] text-[#0298D8] flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h2 className="text-[14px] font-bold text-[#0F172A]">
                        Transaction Details
                      </h2>
                    </div>
                    <span className="text-[10.5px] font-semibold tracking-wider uppercase text-slate-400">
                      Step 1 of 3
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Date Received */}
                      <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                          Date Received
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="date"
                            value={dateReceived}
                            onChange={(e) => setDateReceived(e.target.value)}
                            className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#0298D8] focus:ring-2 focus:ring-[#0298D8]/15 transition"
                          />
                        </div>
                      </div>

                      {/* Type of Transaction */}
                      <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                          Type of Transaction
                        </label>
                        <div className="relative">
                          <select
                            value={transactionType}
                            onChange={(e) => {
                              setTransactionType(e.target.value);
                              setFormError('');
                            }}
                            className={`w-full h-10 pl-3.5 pr-9 rounded-xl border border-slate-200 bg-white text-xs font-medium appearance-none focus:outline-none focus:border-[#0298D8] focus:ring-2 focus:ring-[#0298D8]/15 transition cursor-pointer ${
                              transactionType ? 'text-[#0F172A]' : 'text-slate-400'
                            }`}
                          >
                            <option value="">Select transaction type</option>
                            {TRANSACTION_TYPES.map((t) => (
                              <option key={t} value={t} className="text-[#0F172A]">
                                {t}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Submitted Through */}
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-2">
                        Submitted Through
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {CHANNELS.map((ch) => {
                          const active = submittedThrough === ch.id;
                          return (
                            <button
                              key={ch.id}
                              type="button"
                              onClick={() => setSubmittedThrough(ch.id)}
                              className={`px-3.5 py-2.5 rounded-xl border text-left transition cursor-pointer ${
                                active
                                  ? 'border-[#0298D8] bg-[#F2FAFE] ring-1 ring-[#0298D8]/20'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              <div
                                className={`text-xs font-bold ${
                                  active ? 'text-[#0284C7]' : 'text-[#0F172A]'
                                }`}
                              >
                                {ch.label}
                              </div>
                              <div className="text-[10.5px] text-slate-400 mt-0.5">
                                {ch.subtitle}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2. UPIs Connected to the Transaction */}
                <section className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
                  <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#EFF8FD] text-[#0298D8] flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </div>
                      <h2 className="text-[14px] font-bold text-[#0F172A]">
                        UPIs Connected to the Transaction
                      </h2>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                      {connectedUpis.length} linked
                    </span>
                  </div>

                  <div className="p-5 space-y-3.5">
                    {/* UPI Input Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                      <label className="text-xs font-semibold text-[#0F172A] shrink-0 w-10">
                        UPI:
                      </label>
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={upiInput}
                          onFocus={() => setUpiFocused(true)}
                          onBlur={() => setTimeout(() => setUpiFocused(false), 150)}
                          onChange={(e) => {
                            setUpiInput(e.target.value);
                            setUpiFocused(true);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addUpi();
                            }
                          }}
                          placeholder="e.g. 1/01/05/01/603 or search owner..."
                          className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-mono-code text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0298D8] focus:ring-2 focus:ring-[#0298D8]/15 transition"
                        />

                        {/* Quick Parcel Suggestions Dropdown */}
                        {upiFocused && upiSuggestions.length > 0 && (
                          <div className="absolute left-0 right-0 top-[44px] bg-white rounded-xl border border-slate-200 shadow-xl z-30 overflow-hidden divide-y divide-slate-100">
                            <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                              Quick Select Registered Parcel
                            </div>
                            {upiSuggestions.map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  addUpi(s.upi);
                                }}
                                className="w-full px-3.5 py-2 flex items-center justify-between text-left hover:bg-[#F2FAFE] transition cursor-pointer"
                              >
                                <div>
                                  <div className="font-mono-code text-xs font-semibold text-[#0284C7]">
                                    {s.upi}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    {s.owner} · {s.district}, {s.sector}
                                  </div>
                                </div>
                                <span className="text-[11px] font-mono-code text-slate-400">
                                  {s.sizeSqm.toFixed(0)} sqm
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => addUpi()}
                          className="h-10 px-4 rounded-xl bg-[#0298D8] hover:bg-[#0284C7] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add
                        </button>
                        <button
                          type="button"
                          disabled={!selectedUpiRow}
                          onClick={removeSelectedUpi}
                          className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 disabled:opacity-45 disabled:pointer-events-none transition cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Connected UPIs Table */}
                    <div className="rounded-xl border border-slate-200/90 overflow-hidden">
                      <div className="bg-[#F8FAFC] px-4 py-2 border-b border-slate-200/80 grid grid-cols-12 text-[10.5px] font-bold tracking-wider uppercase text-slate-400">
                        <div className="col-span-4">UPI</div>
                        <div className="col-span-4">OWNER</div>
                        <div className="col-span-3">LOCATION / AREA</div>
                        <div className="col-span-1 text-right"></div>
                      </div>

                      {connectedUpis.length === 0 ? (
                        <div className="py-8 px-4 text-center text-xs text-slate-400">
                          No UPIs added yet. Enter a UPI above and click{' '}
                          <span className="font-semibold text-slate-500">Add</span>.
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {connectedUpis.map((item) => {
                            const selected = selectedUpiRow === item.upi;
                            return (
                              <div
                                key={item.upi}
                                onClick={() => setSelectedUpiRow(selected ? null : item.upi)}
                                className={`px-4 py-2.5 grid grid-cols-12 items-center text-xs transition cursor-pointer ${
                                  selected ? 'bg-[#EFF8FD]' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div className="col-span-4 font-mono-code font-semibold text-[#0284C7] truncate pr-2">
                                  {item.upi}
                                </div>
                                <div className="col-span-4 font-medium text-[#0F172A] truncate pr-2">
                                  {item.owner}
                                </div>
                                <div className="col-span-3 text-[11px] text-slate-500 truncate">
                                  {item.district}
                                  {item.areaSqm !== null ? ` · ${item.areaSqm.toFixed(0)} sqm` : ''}
                                </div>
                                <div className="col-span-1 text-right">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeSingleUpi(item.upi);
                                    }}
                                    className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                                    aria-label={`Remove ${item.upi}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* 3. Contact Information */}
                <section className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#EFF8FD] text-[#0298D8] flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <h2 className="text-[14px] font-bold text-[#0F172A]">
                        Contact Information
                      </h2>
                    </div>

                    {connectedUpis.some((u) => u.knownParcel) && (
                      <button
                        type="button"
                        onClick={handleFillFromOwner}
                        className="text-[11px] font-semibold text-[#0298D8] hover:text-[#0284C7] hover:underline cursor-pointer"
                      >
                        Use linked parcel owner
                      </button>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Type of Identification */}
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-2">
                        Type of Identification
                      </label>
                      <div className="inline-flex flex-wrap gap-2">
                        {ID_TYPES.map((item) => {
                          const active = idType === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setIdType(item.id)}
                              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                                active
                                  ? 'border-[#0298D8] bg-[#F2FAFE] text-[#0284C7]'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              {item.id}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Identification No */}
                      <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                          Identification No
                        </label>
                        <input
                          type="text"
                          value={idNumber}
                          onChange={(e) => setIdNumber(e.target.value)}
                          placeholder={activeIdPlaceholder}
                          className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-mono-code text-xs text-[#0F172A] placeholder:text-slate-400 placeholder:font-sans focus:outline-none focus:border-[#0298D8] focus:ring-2 focus:ring-[#0298D8]/15 transition"
                        />
                      </div>

                      {/* Name of Applicant */}
                      <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                          Name of Applicant
                        </label>
                        <input
                          type="text"
                          value={applicantName}
                          onChange={(e) => setApplicantName(e.target.value)}
                          placeholder="Enter full name of applicant"
                          className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0298D8] focus:ring-2 focus:ring-[#0298D8]/15 transition"
                        />
                      </div>

                      {/* Phone No */}
                      <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                          Phone No
                        </label>
                        <div className="flex items-center h-10 rounded-xl border border-slate-200 bg-white focus-within:border-[#0298D8] focus-within:ring-2 focus-within:ring-[#0298D8]/15 transition overflow-hidden">
                          <span className="h-full px-3 bg-slate-50 border-r border-slate-200 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 shrink-0">
                            <Phone className="w-3 h-3 text-slate-400" />
                            +250
                          </span>
                          <input
                            type="tel"
                            value={phoneNo}
                            onChange={(e) => setPhoneNo(e.target.value)}
                            placeholder="7XX XXX XXX"
                            className="flex-1 h-full px-3 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none font-mono-code"
                          />
                        </div>
                      </div>

                      {/* Country */}
                      <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                          Country
                        </label>
                        <div className="relative">
                          <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full h-10 pl-3.5 pr-9 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#0F172A] appearance-none focus:outline-none focus:border-[#0298D8] focus:ring-2 focus:ring-[#0298D8]/15 transition cursor-pointer"
                          >
                            {COUNTRIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* District */}
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                        District
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full h-10 pl-10 pr-9 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#0F172A] appearance-none focus:outline-none focus:border-[#0298D8] focus:ring-2 focus:ring-[#0298D8]/15 transition cursor-pointer"
                        >
                          {DISTRICTS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Optional Officer Intake Remarks */}
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                        Intake Remarks <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add supporting document checklist notes or special instructions..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0298D8] focus:ring-2 focus:ring-[#0298D8]/15 transition resize-none"
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Live Booking Summary & Submit */}
              <aside className="lg:col-span-4 lg:sticky lg:top-4 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_6px_24px_rgba(15,23,42,0.05)] overflow-hidden">
                  <div className="px-5 py-4 bg-gradient-to-br from-[#F4FAFE] to-white border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#0298D8]" />
                      <h3 className="text-[13.5px] font-bold text-[#0F172A]">
                        Booking Summary
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#E6F6FD] text-[#0284C7] text-[10.5px] font-bold">
                      {submittedThrough}
                    </span>
                  </div>

                  <div className="p-5 space-y-4 text-xs">
                    {/* Summary Grid */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Date Received</span>
                        <span className="font-mono-code font-semibold text-[#0F172A]">
                          {dateReceived || '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400 shrink-0">Transaction</span>
                        <span className="font-semibold text-[#0F172A] text-right truncate">
                          {transactionType || 'Not selected'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Linked UPIs</span>
                        <span className="font-semibold text-[#0284C7] tabular-nums">
                          {connectedUpis.length}{' '}
                          {totalAreaSqm > 0 ? `(${totalAreaSqm.toLocaleString()} sqm)` : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400 shrink-0">Applicant</span>
                        <span className="font-semibold text-[#0F172A] text-right truncate">
                          {applicantName.trim() || '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Jurisdiction</span>
                        <span className="font-semibold text-[#0F172A]">
                          {district}, {country}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3.5 space-y-2">
                      <div className="text-[10.5px] font-bold tracking-wider uppercase text-slate-400">
                        Readiness Checklist
                      </div>
                      {[
                        { label: 'Transaction type & date', done: hasDetails },
                        { label: 'At least 1 UPI connected', done: hasUpis },
                        { label: 'Applicant contact complete', done: hasContact },
                      ].map((chk) => (
                        <div key={chk.label} className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center transition ${
                              chk.done
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-100 text-slate-300'
                            }`}
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                          <span
                            className={
                              chk.done ? 'text-[#0F172A] font-medium' : 'text-slate-400'
                            }
                          >
                            {chk.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {formError && (
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200/80 text-[11.5px] text-red-600 font-medium">
                        {formError}
                      </div>
                    )}

                    <div className="pt-1 space-y-2">
                      <button
                        type="submit"
                        className={`w-full h-10 rounded-xl text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          isReadyToBook
                            ? 'bg-[#0298D8] hover:bg-[#0284C7] shadow-[0_6px_16px_rgba(2,152,216,0.28)]'
                            : 'bg-[#58BCE8] hover:bg-[#0298D8]'
                        }`}
                      >
                        <BookPlus className="w-4 h-4" />
                        Book Transaction
                      </button>

                      <button
                        type="button"
                        onClick={handleReset}
                        className="w-full h-9 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Form
                      </button>
                    </div>
                  </div>
                </div>
              </aside>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
