export type AppScreen = 'welcome' | 'login' | 'dashboard' | 'search' | 'book' | 'parcel';

export type KpiStatusKey =
  | 'Received'
  | 'Booked'
  | 'Accepted'
  | 'Processing'
  | 'Returned'
  | 'Processed'
  | 'Approved'
  | 'Completed'
  | 'Rejected';

export type TransactionStatus =
  | 'Received'
  | 'Booked'
  | 'Accepted'
  | 'Processing'
  | 'Returned'
  | 'Processed'
  | 'Approved'
  | 'Completed'
  | 'Rejected'
  | 'Printed';

export type IntegrationSource =
  | 'LAIS'
  | 'IREMBO'
  | 'IECMS'
  | 'BPMIS'
  | 'Ubutaka'
  | 'IFMIS'
  | 'RDB';

export type ProvinceName =
  | 'Kigali City'
  | 'Southern'
  | 'Western'
  | 'Northern'
  | 'Eastern'
  | 'National';

export interface CondoUnitRight {
  id: string;
  name: string;
  nationalId: string;
  share: string;
  phone: string;
  address: string;
  representative?: string;
}

export interface CondoDetails {
  unitUpi: string;
  unitIndex: string;
  flatNo: string;
  floorNo: string;
  landUse: string;
  condoType: string;
  unitArea: string;
  rightType: string;
  startDate: string;
  startTransactionId: string;
  endTransactionId: string;
  isProvisional: 'Yes' | 'No';
}

export interface BoundaryCorrectionItem {
  id: string;
  upi: string;
  title: string;
  date: string;
  status: 'Verified' | 'Pending';
}

export interface RestrictionItem {
  id: string;
  typeName: string;
  startDate: string;
  authority: string;
}

export interface MortgageItem {
  id: string;
  registrationNo: string;
  loanAmountRwf: number;
  lender: string;
  startDate: string;
  status: 'Active' | 'Discharged';
}

export interface ObjectAnnotationItem {
  id: string;
  upi: string;
  text: string;
  type: string;
}

export interface ParcelTransaction {
  id: string;
  dateLabel: string;
  reference: string;
  type: string;
  category: 'Transactions' | 'Company Txns' | 'Other Txns';
  status: TransactionStatus;
  source: IntegrationSource;
  province: ProvinceName;
  applicant: string;
  overdue?: boolean;
}

export interface AttachmentItem {
  id: string;
  fileName: string;
  fileType: 'PDF' | 'IMG' | 'DOC';
  sizeLabel: string;
  dateLabel: string;
  description: string;
}

export interface TransactionComment {
  id: string;
  initials: string;
  avatarBg: string;
  author: string;
  role: string;
  timestampLabel: string;
  body: string;
}

export interface TransactionHistoryEntry {
  id: string;
  status: 'PROCESSING' | 'PROCESSED' | 'RETURNED' | 'APPROVED' | 'ACCEPTED' | 'REJECTED' | 'BOOKED';
  user: string;
  startTimestamp: string;
}

export interface RelatedParcelRef {
  upi: string;
  owner: string;
  areaSqm: number;
  district?: string;
  note?: string;
  status: 'Active' | 'Pending';
}

export interface ParcelRecord {
  id: string;
  indexNumber: number;
  upi: string;
  owner: string;
  nationalId: string;
  province: ProvinceName;
  district: string;
  sector: string;
  cell: string;
  village: string;
  landUse: 'Residential' | 'Agricultural' | 'Commercial' | 'Industrial' | 'Leasehold';
  plannedLandUse: string;
  leaseTerm: string;
  sizeSqm: number;
  hasCondoUnits: boolean;
  rightType: string;
  transactionId: string;
  status: KpiStatusKey;
  source: IntegrationSource;
  date: string;
  condoDetails: CondoDetails;
  condoRights: CondoUnitRight[];
  previousOwners: CondoUnitRight[];
  boundaryCorrections: BoundaryCorrectionItem[];
  restrictions: RestrictionItem[];
  mortgages: MortgageItem[];
  annotations: ObjectAnnotationItem[];
  transactions: ParcelTransaction[];
  attachments: AttachmentItem[];
  comments: TransactionComment[];
  history: TransactionHistoryEntry[];
  parents: RelatedParcelRef[];
  children: RelatedParcelRef[];
}

export interface OverdueNotification {
  id: string;
  upi: string;
  transactionRef: string;
  title: string;
  daysOverdue: number;
  province: ProvinceName;
  unread: boolean;
}
