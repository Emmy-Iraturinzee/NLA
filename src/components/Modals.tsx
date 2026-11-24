import React, { useRef, useState } from 'react';
import {
  CheckCircle2,
  FileText,
  Paperclip,
  Printer,
  Upload,
  X,
} from 'lucide-react';
import {
  AttachmentItem,
  CondoUnitRight,
  MortgageItem,
  ParcelRecord,
  ParcelTransaction,
} from '../types/lais';
import { NlaLogo } from './NlaLogo';

/* -------------------------------------------------------------------------- */
/* 1. Add Attachment Modal (Exact match to Image 13)                          */
/* -------------------------------------------------------------------------- */
interface AddAttachmentModalProps {
  onClose: () => void;
  onUpload: (attachment: AttachmentItem) => void;
}

export const AddAttachmentModal: React.FC<AddAttachmentModalProps> = ({
  onClose,
  onUpload,
}) => {
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    sizeLabel: string;
    fileType: 'PDF' | 'IMG' | 'DOC';
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilePicked = (file: File | undefined) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const fileType: 'PDF' | 'IMG' | 'DOC' =
      ext === 'pdf'
        ? 'PDF'
        : ['png', 'jpg', 'jpeg', 'webp'].includes(ext)
        ? 'IMG'
        : 'DOC';
    const sizeKb = file.size / 1024;
    const sizeLabel =
      sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(sizeKb))} KB`;
    setSelectedFile({ name: file.name, sizeLabel, fileType });
  };

  const canSubmit = description.trim().length > 0 && selectedFile !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !selectedFile) return;
    onUpload({
      id: `att-${Date.now()}`,
      fileName: selectedFile.name,
      fileType: selectedFile.fileType,
      sizeLabel: selectedFile.sizeLabel,
      dateLabel: '24 Nov 2026',
      description: description.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8F6FD] text-[#0298D8] flex items-center justify-center shrink-0">
              <Paperclip className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#0F172A]">Add Attachment</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Add a description then select your file
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Description <span className="text-slate-400 font-normal">(required)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this attachment..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0298D8] focus:ring-2 focus:ring-[#0298D8]/15 resize-none"
            />
          </div>

          {/* File Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">File</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              className="hidden"
              onChange={(e) => handleFilePicked(e.target.files?.[0])}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFilePicked(e.dataTransfer.files?.[0]);
              }}
              className={`rounded-xl border-2 border-dashed py-8 px-4 text-center transition cursor-pointer ${
                isDragging
                  ? 'border-[#0298D8] bg-[#F2FAFE]'
                  : selectedFile
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2.5">
                <Upload className="w-4 h-4" />
              </div>
              {selectedFile ? (
                <div>
                  <div className="text-xs font-semibold text-[#0F172A]">
                    {selectedFile.name}
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-0.5">
                    {selectedFile.sizeLabel} · Ready to upload (click to change)
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs font-semibold text-[#0F172A]">
                    Click to browse or drag &amp; drop
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    PDF, images, Word documents supported
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition cursor-pointer ${
                canSubmit
                  ? 'bg-[#0298D8] hover:bg-[#0284C7]'
                  : 'bg-[#93D6F5] cursor-not-allowed'
              }`}
            >
              <Paperclip className="w-3.5 h-3.5" />
              Upload Attachment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. Quick Action Confirmation Modal                                         */
/* -------------------------------------------------------------------------- */
export type QuickActionType = 'Accept' | 'Process' | 'Reverse' | 'Reject' | 'Approve';

interface QuickActionModalProps {
  action: QuickActionType;
  transaction: ParcelTransaction;
  onClose: () => void;
  onConfirm: (note: string) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  action,
  transaction,
  onClose,
  onConfirm,
}) => {
  const [note, setNote] = useState('');
  const requiresReason = action === 'Reject' || action === 'Reverse';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requiresReason && !note.trim()) return;
    onConfirm(note.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-[#0F172A]">
              Confirm {action} Transaction
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {transaction.type} · <span className="font-mono-code">{transaction.reference}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Current Status:</span>
              <span className="font-semibold text-[#0F172A]">{transaction.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Source System:</span>
              <span className="font-semibold text-[#0F172A]">{transaction.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Applicant:</span>
              <span className="font-semibold text-[#0F172A]">{transaction.applicant}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Officer Remark {requiresReason ? '(required)' : '(optional)'}
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                requiresReason
                  ? `Provide reason for ${action.toLowerCase()}ing this transaction...`
                  : 'Add an audit note for transaction history...'
              }
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0298D8] focus:ring-2 focus:ring-[#0298D8]/15 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={requiresReason && !note.trim()}
              className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition cursor-pointer ${
                action === 'Reject'
                  ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'
                  : 'bg-[#0298D8] hover:bg-[#0284C7] disabled:bg-sky-300'
              }`}
            >
              Confirm {action}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. Transaction / Document / Mortgage Preview Modal                         */
/* -------------------------------------------------------------------------- */
interface PreviewModalProps {
  title: string;
  subtitle: string;
  parcel: ParcelRecord;
  transaction?: ParcelTransaction | null;
  attachment?: AttachmentItem | null;
  mortgage?: MortgageItem | null;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  title,
  subtitle,
  parcel,
  transaction,
  attachment,
  mortgage,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-[620px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EFF8FD] text-[#0298D8] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
              <p className="text-xs text-slate-400">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 bg-slate-50/70 max-h-[70vh] overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <NlaLogo compact />
              <div className="text-right">
                <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  REPUBLIC OF RWANDA
                </div>
                <div className="text-xs font-bold text-[#0F172A]">
                  NATIONAL LAND AUTHORITY (NLA)
                </div>
              </div>
            </div>

            {transaction && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">
                    TRANSACTION TYPE
                  </div>
                  <div className="font-semibold text-[#0F172A] mt-0.5">{transaction.type}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">STATUS</div>
                  <div className="font-semibold text-[#0284C7] mt-0.5">{transaction.status}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">
                    PARCEL UPI
                  </div>
                  <div className="font-mono-code font-semibold text-[#0F172A] mt-0.5">
                    {parcel.upi}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">
                    REGISTERED OWNER
                  </div>
                  <div className="font-semibold text-[#0F172A] mt-0.5">{parcel.owner}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">
                    LOCATION
                  </div>
                  <div className="text-slate-700 mt-0.5">
                    {parcel.province} · {parcel.district} · {parcel.sector}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">
                    PARCEL AREA &amp; USE
                  </div>
                  <div className="text-slate-700 mt-0.5">
                    {parcel.sizeSqm.toFixed(2)} sqm · {parcel.landUse}
                  </div>
                </div>
              </div>
            )}

            {attachment && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="font-semibold text-[#0F172A]">{attachment.fileName}</span>
                  <span className="text-slate-400">
                    {attachment.sizeLabel} · {attachment.dateLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{attachment.description}</p>
                <div className="h-44 rounded-lg border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center p-4">
                  <CheckCircle2 className="w-7 h-7 text-[#0298D8] mb-2" />
                  <div className="text-xs font-semibold text-[#0F172A]">
                    Verified Registry Document ({attachment.fileType})
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Linked to Parcel UPI {parcel.upi} · Digital Seal Valid
                  </div>
                </div>
              </div>
            )}

            {mortgage && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">
                    REGISTRATION NO
                  </div>
                  <div className="font-mono-code font-semibold text-[#0284C7] mt-0.5">
                    {mortgage.registrationNo}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">
                    LOAN AMOUNT
                  </div>
                  <div className="font-mono-code font-bold text-[#0F172A] mt-0.5">
                    {mortgage.loanAmountRwf.toLocaleString()} RWF
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">
                    LENDER / INSTITUTION
                  </div>
                  <div className="font-semibold text-[#0F172A] mt-0.5">{mortgage.lender}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">
                    REGISTRATION DATE
                  </div>
                  <div className="font-mono-code text-slate-700 mt-0.5">{mortgage.startDate}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-white">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0298D8] hover:bg-[#0284C7] text-white text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 4. Parcel Field / Condo Unit Action Modal                                  */
/* -------------------------------------------------------------------------- */
interface ParcelEditModalProps {
  mode:
    | 'book'
    | 'landUse'
    | 'rightType'
    | 'condoShow'
    | 'condoRep'
    | 'condoAddress';
  parcel: ParcelRecord;
  selectedRight?: CondoUnitRight | null;
  onClose: () => void;
  onSaveBook: (txnType: string, applicant: string) => void;
  onSaveLandUse: (landUse: ParcelRecord['landUse'], planned: string) => void;
  onSaveRightType: (rightType: string) => void;
  onSaveCondoAddress: (rightId: string, newAddress: string, newRep: string) => void;
}

export const ParcelEditModal: React.FC<ParcelEditModalProps> = ({
  mode,
  parcel,
  selectedRight,
  onClose,
  onSaveBook,
  onSaveLandUse,
  onSaveRightType,
  onSaveCondoAddress,
}) => {
  const [txnType, setTxnType] = useState('Lease Registration');
  const [applicant, setApplicant] = useState(parcel.owner);
  const [landUse, setLandUse] = useState<ParcelRecord['landUse']>(parcel.landUse);
  const [planned, setPlanned] = useState(parcel.plannedLandUse);
  const [rightType, setRightType] = useState(parcel.rightType);
  const targetRight = selectedRight ?? parcel.condoRights[0];
  const [address, setAddress] = useState(targetRight?.address ?? '');
  const [rep, setRep] = useState(targetRight?.representative ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'book') onSaveBook(txnType, applicant);
    if (mode === 'landUse') onSaveLandUse(landUse, planned);
    if (mode === 'rightType') onSaveRightType(rightType);
    if ((mode === 'condoAddress' || mode === 'condoRep') && targetRight) {
      onSaveCondoAddress(targetRight.id, address, rep);
    }
    onClose();
  };

  const titles: Record<typeof mode, string> = {
    book: 'Book New Parcel Transaction',
    landUse: 'Update Parcel Land Use',
    rightType: 'Update Right Type',
    condoShow: 'Condominium Rights Holder Details',
    condoRep: 'Legal Representative Assignment',
    condoAddress: 'Correct Holder Address',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">{titles[mode]}</h3>
            <p className="text-xs font-mono-code text-slate-400 mt-0.5">{parcel.upi}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'book' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transaction Type
                </label>
                <select
                  value={txnType}
                  onChange={(e) => setTxnType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-[#0F172A]"
                >
                  <option>Lease Registration</option>
                  <option>Right Update</option>
                  <option>Subdivision</option>
                  <option>Land Use Update</option>
                  <option>Mortgage Registration</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Applicant Name
                </label>
                <input
                  type="text"
                  value={applicant}
                  onChange={(e) => setApplicant(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-[#0F172A]"
                />
              </div>
            </>
          )}

          {mode === 'landUse' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Land Use
                </label>
                <select
                  value={landUse}
                  onChange={(e) => setLandUse(e.target.value as ParcelRecord['landUse'])}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-[#0F172A]"
                >
                  <option value="Residential">Residential</option>
                  <option value="Agricultural">Agricultural</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Leasehold">Leasehold</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Planned Land Use
                </label>
                <input
                  type="text"
                  value={planned}
                  onChange={(e) => setPlanned(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-[#0F172A]"
                />
              </div>
            </>
          )}

          {mode === 'rightType' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Right Type
              </label>
              <select
                value={rightType}
                onChange={(e) => setRightType(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-[#0F172A]"
              >
                <option>Freehold</option>
                <option>Emphyteutic Lease</option>
                <option>Condominium</option>
                <option>Public Utility Right</option>
              </select>
            </div>
          )}

          {mode === 'condoShow' && targetRight && (
            <div className="space-y-2.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Full Name:</span>
                <span className="font-bold text-[#0F172A]">{targetRight.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">National ID:</span>
                <span className="font-mono-code text-[#0F172A]">{targetRight.nationalId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ownership Share:</span>
                <span className="font-semibold text-[#0284C7]">{targetRight.share}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="text-[#0F172A]">{targetRight.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Address:</span>
                <span className="text-[#0F172A]">{targetRight.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Representative:</span>
                <span className="text-[#0F172A]">{targetRight.representative || 'None'}</span>
              </div>
            </div>
          )}

          {(mode === 'condoRep' || mode === 'condoAddress') && targetRight && (
            <>
              <div className="text-xs text-slate-500">
                Updating record for <span className="font-bold text-[#0F172A]">{targetRight.name}</span>
              </div>
              {mode === 'condoRep' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Representative Name
                  </label>
                  <input
                    type="text"
                    value={rep}
                    onChange={(e) => setRep(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-[#0F172A]"
                  />
                </div>
              )}
              {mode === 'condoAddress' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Verified Physical Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-[#0F172A]"
                  />
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {mode === 'condoShow' ? 'Close' : 'Cancel'}
            </button>
            {mode !== 'condoShow' && (
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#0298D8] hover:bg-[#0284C7] text-white text-xs font-semibold cursor-pointer"
              >
                Save Changes
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
