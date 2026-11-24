import {
  IntegrationSource,
  KpiStatusKey,
  OverdueNotification,
  ParcelRecord,
  ParcelTransaction,
  ProvinceName,
} from '../types/lais';

export const KPI_CARDS_META: Array<{
  key: KpiStatusKey;
  label: string;
  baseCount: number;
  delta: string;
  isNegative?: boolean;
}> = [
  { key: 'Received', label: 'RECEIVED', baseCount: 1284, delta: '+12%' },
  { key: 'Booked', label: 'BOOKED', baseCount: 342, delta: '+8%' },
  { key: 'Accepted', label: 'ACCEPTED', baseCount: 918, delta: '+15%' },
  { key: 'Processing', label: 'PROCESSING', baseCount: 476, delta: '+6%' },
  { key: 'Returned', label: 'RETURNED', baseCount: 89, delta: '+18%', isNegative: true },
  { key: 'Processed', label: 'PROCESSED', baseCount: 631, delta: '+5%' },
  { key: 'Approved', label: 'APPROVED', baseCount: 504, delta: '+11%' },
  { key: 'Completed', label: 'COMPLETED', baseCount: 1021, delta: '+9%' },
  { key: 'Rejected', label: 'REJECTED', baseCount: 57, delta: '+2%', isNegative: true },
];

export const MONTHLY_ACTIVITY_DATA = [
  { month: 'Jan', value: 230 },
  { month: 'Feb', value: 300 },
  { month: 'Mar', value: 388 },
  { month: 'Apr', value: 412 },
  { month: 'May', value: 492 },
  { month: 'Jun', value: 525 },
  { month: 'Jul', value: 604 },
  { month: 'Aug', value: 550 },
  { month: 'Sep', value: 485 },
  { month: 'Oct', value: 392 },
  { month: 'Nov', value: 310 },
  { month: 'Dec', value: 265 },
];

export const LAND_USE_BREAKDOWN = [
  { name: 'Residential', count: 4821, color: '#0298D8' },
  { name: 'Agricultural', count: 3102, color: '#2FB9F1' },
  { name: 'Commercial', count: 1340, color: '#8A9BB0' },
  { name: 'Industrial', count: 618, color: '#C1CCD8' },
  { name: 'Leasehold', count: 409, color: '#DCE3EC' },
];

export const TRANSACTION_SOURCE_TOTALS: Array<{
  source: IntegrationSource;
  role: string;
  count: number;
  percent: number;
  recordsCount: number;
  color: string;
  delta: string;
}> = [
  { source: 'LAIS', role: 'Core Registry', count: 3812, percent: 38, recordsCount: 18, color: '#0284C7', delta: '+14%' },
  { source: 'IREMBO', role: 'Citizen Portal', count: 2530, percent: 25, recordsCount: 12, color: '#0EA5E9', delta: '+21%' },
  { source: 'IECMS', role: 'Judiciary Sync', count: 1518, percent: 15, recordsCount: 7, color: '#38BDF8', delta: '+9%' },
  { source: 'BPMIS', role: 'Building Permits', count: 1012, percent: 10, recordsCount: 5, color: '#14B8A6', delta: '+11%' },
  { source: 'Ubutaka', role: 'Land Portal', count: 607, percent: 6, recordsCount: 3, color: '#6366F1', delta: '+7%' },
  { source: 'IFMIS', role: 'Public Finance', count: 405, percent: 4, recordsCount: 2, color: '#8B5CF6', delta: '+4%' },
  { source: 'RDB', role: 'Business Reg.', count: 236, percent: 2, recordsCount: 1, color: '#64748B', delta: '+6%' },
];

export const LOCATION_HIERARCHY: Record<
  Exclude<ProvinceName, 'National'>,
  Record<string, Record<string, string[]>>
> = {
  'Kigali City': {
    Gasabo: {
      Kimironko: ['Bibare', 'Kibagabaga', 'Nyagatovu'],
      Remera: ['Nyabisindu', 'Nyarutarama', 'Rukiri I'],
      Kacyiru: ['Kamatamu', 'Kamutwa', 'Kibaza'],
    },
    Kicukiro: {
      Niboye: ['Gatare', 'Niboye', 'Nyakabanda'],
      Kanombe: ['Busanza', 'Kabeza', 'Karama'],
    },
    Nyarugenge: {
      Nyarugenge: ['Agatare', 'Biryogo', 'Kiyovu'],
    },
  },
  Southern: {
    Huye: {
      Ngoma: ['Butare', 'Kaburemera', 'Matyazo'],
      Tumba: ['Cyarwa', 'Gitwa', 'Mpare'],
    },
    Muhanga: {
      Nyamabuye: ['Gahogo', 'Gifumba', 'Remera'],
    },
  },
  Western: {
    Rubavu: {
      Gisenyi: ['Bugoyi', 'Kivumu', 'Nengo'],
    },
    Rusizi: {
      Kamembe: ['Cyangugu', 'Gihundwe', 'Kamashangi'],
    },
  },
  Northern: {
    Musanze: {
      Muhoza: ['Cyabararika', 'Kigombe', 'Mpenge'],
    },
  },
  Eastern: {
    Rwamagana: {
      Kigabiro: ['Cyanya', 'Nyagasenyi', 'Sibagire'],
    },
  },
};

export const INITIAL_NOTIFICATIONS: OverdueNotification[] = [
  {
    id: 'notif-1',
    upi: '1/01/03/02/0891',
    transactionRef: 'TRX-2024-04821',
    title: 'Lease Registration overdue (6 days in Processing)',
    daysOverdue: 6,
    province: 'Kigali City',
    unread: true,
  },
  {
    id: 'notif-2',
    upi: '1/02/12/08/3356',
    transactionRef: 'TRX-2024-04902',
    title: 'Condominium Title Verification awaiting supervisor sign-off',
    daysOverdue: 4,
    province: 'Kigali City',
    unread: true,
  },
  {
    id: 'notif-3',
    upi: '1/03/01/04/3000',
    transactionRef: 'TRX-2024-04755',
    title: 'Boundary Correction requires GIS survey re-check',
    daysOverdue: 8,
    province: 'Southern',
    unread: true,
  },
  {
    id: 'notif-4',
    upi: '1/02/08/05/1120',
    transactionRef: 'TRX-2024-04619',
    title: 'Mortgage Discharge pending bank clearance letter',
    daysOverdue: 3,
    province: 'Kigali City',
    unread: true,
  },
  {
    id: 'notif-5',
    upi: '1/04/02/03/2214',
    transactionRef: 'TRX-2024-04580',
    title: 'Subdivision approval returned for applicant ID verification',
    daysOverdue: 5,
    province: 'Northern',
    unread: true,
  },
];

const DEFAULT_TRANSACTIONS = (
  upi: string,
  province: ProvinceName,
  indexNumber: number,
  owner: string
): ParcelTransaction[] => {
  const baseTransactions: ParcelTransaction[] = [
    {
      id: `tx-${upi}-1`,
      dateLabel: 'May 20,',
      reference: upi,
      type: 'Lease Registration',
      category: 'Transactions',
      status: 'Processing',
      source: 'LAIS',
      province,
      applicant: owner,
      overdue: indexNumber <= 5,
    },
    {
      id: `tx-${upi}-2`,
      dateLabel: 'Apr 10,',
      reference: upi,
      type: 'Right Update',
      category: 'Transactions',
      status: 'Accepted',
      source: 'IREMBO',
      province,
      applicant: owner,
    },
    {
      id: `tx-${upi}-3`,
      dateLabel: 'Mar 15,',
      reference: upi,
      type: 'Land Use Update',
      category: 'Transactions',
      status: 'Completed',
      source: 'BPMIS',
      province,
      applicant: owner,
    },
    {
      id: `tx-${upi}-4`,
      dateLabel: 'Feb 02,',
      reference: `TXN-2024-${String(indexNumber * 100 + 1).padStart(6, '0')}`,
      type: 'Subdivision',
      category: 'Transactions',
      status: 'Booked',
      source: 'LAIS',
      province,
      applicant: owner,
    },
    {
      id: `tx-${upi}-5`,
      dateLabel: 'Jan 11,',
      reference: upi,
      type: 'Application',
      category: 'Transactions',
      status: 'Printed',
      source: 'IREMBO',
      province,
      applicant: owner,
    },
    {
      id: `tx-${upi}-6`,
      dateLabel: 'Dec 19,',
      reference: `TXN-2023-${String(indexNumber * 100 + 6).padStart(6, '0')}`,
      type: 'Title Merge',
      category: 'Transactions',
      status: 'Completed',
      source: 'Ubutaka',
      province,
      applicant: owner,
    },
  ];

  if (indexNumber === 2 || indexNumber % 3 === 0) {
    baseTransactions.push({
      id: `tx-${upi}-7`,
      dateLabel: 'Nov 08,',
      reference: `TXN-2023-${String(indexNumber * 100 + 7).padStart(6, '0')}`,
      type: 'Mortgage Registration',
      category: 'Transactions',
      status: 'Approved',
      source: 'IFMIS',
      province,
      applicant: 'Bank of Kigali Plc',
    });
  }

  if (indexNumber === 2 || indexNumber % 4 === 0) {
    baseTransactions.push({
      id: `tx-${upi}-8`,
      dateLabel: 'Oct 22,',
      reference: `TXN-2023-${String(indexNumber * 100 + 8).padStart(6, '0')}`,
      type: 'Boundary Survey',
      category: 'Transactions',
      status: 'Completed',
      source: 'LAIS',
      province,
      applicant: owner,
    });
  }

  if (indexNumber === 2 || indexNumber % 6 === 0) {
    baseTransactions.push({
      id: `tx-${upi}-9`,
      dateLabel: 'Sep 14,',
      reference: `TXN-2023-${String(indexNumber * 100 + 9).padStart(6, '0')}`,
      type: 'Caveat Lifting',
      category: 'Transactions',
      status: 'Processed',
      source: 'IECMS',
      province,
      applicant: owner,
    });
  }

  if (indexNumber === 2 || indexNumber % 5 === 0) {
    baseTransactions.push({
      id: `tx-${upi}-10`,
      dateLabel: 'Aug 03,',
      reference: `TXN-2023-${String(indexNumber * 100 + 10).padStart(6, '0')}`,
      type: 'Sale Transfer',
      category: 'Transactions',
      status: 'Completed',
      source: 'IREMBO',
      province,
      applicant: owner,
    });
  }

  if (indexNumber === 2 || indexNumber % 7 === 0) {
    baseTransactions.push(
      {
        id: `tx-${upi}-13`,
        dateLabel: 'May 12,',
        reference: `TXN-2023-${String(indexNumber * 100 + 13).padStart(6, '0')}`,
        type: 'Corporate Share Transfer',
        category: 'Company Txns',
        status: 'Approved',
        source: 'RDB',
        province,
        applicant: owner,
      },
      {
        id: `tx-${upi}-14`,
        dateLabel: 'Apr 04,',
        reference: `TXN-2023-${String(indexNumber * 100 + 14).padStart(6, '0')}`,
        type: 'Commercial Lease Pledge',
        category: 'Company Txns',
        status: 'Processing',
        source: 'RDB',
        province,
        applicant: owner,
      }
    );
  }

  if (indexNumber === 2 || indexNumber % 4 === 1) {
    baseTransactions.push({
      id: `tx-${upi}-16`,
      dateLabel: 'Feb 15,',
      reference: `TXN-2023-${String(indexNumber * 100 + 16).padStart(6, '0')}`,
      type: 'Court Order Caveat',
      category: 'Other Txns',
      status: 'Accepted',
      source: 'IECMS',
      province,
      applicant: 'High Court Commercial Chamber',
    });
  }

  if (indexNumber === 2 || indexNumber % 5 === 2) {
    baseTransactions.push({
      id: `tx-${upi}-17`,
      dateLabel: 'Jan 29,',
      reference: `TXN-2023-${String(indexNumber * 100 + 17).padStart(6, '0')}`,
      type: 'Tax Lien Notification',
      category: 'Other Txns',
      status: 'Returned',
      source: 'IFMIS',
      province,
      applicant: 'Rwanda Revenue Authority',
    });
  }

  if (indexNumber === 2 || indexNumber % 8 === 0) {
    baseTransactions.push({
      id: `tx-${upi}-18`,
      dateLabel: 'Jan 05,',
      reference: `TXN-2023-${String(indexNumber * 100 + 18).padStart(6, '0')}`,
      type: 'Expropriation Annotation',
      category: 'Other Txns',
      status: 'Completed',
      source: 'BPMIS',
      province,
      applicant: 'City of Kigali',
    });
  }

  return baseTransactions;
};

function createDefaultDetails(
  indexNumber: number,
  upi: string,
  owner: string,
  province: ProvinceName,
  district: string,
  sector: string,
  cell: string,
  village: string,
  landUse: ParcelRecord['landUse'],
  sizeSqm: number,
  status: KpiStatusKey,
  source: IntegrationSource,
  date: string,
  overrides?: Partial<ParcelRecord>
): ParcelRecord {
  const generatedNationalId = `1198${((indexNumber * 73) % 90) + 10}800${10000 + indexNumber * 137}`;
  const isDefaultShowcase = indexNumber === 2;
  const hasBankruptcy = isDefaultShowcase || indexNumber % 9 === 0;
  const hasCourtCaveat = isDefaultShowcase || indexNumber % 4 === 1;
  const hasTaxSeizure = isDefaultShowcase || indexNumber % 5 === 2;
  const hasMortgage = isDefaultShowcase || indexNumber % 3 === 0;

  return {
    id: `parcel-${indexNumber}`,
    indexNumber,
    upi,
    owner,
    nationalId: generatedNationalId,
    province,
    district,
    sector,
    cell,
    village,
    landUse,
    plannedLandUse:
      landUse === 'Residential'
        ? 'Low Density Residential'
        : landUse === 'Commercial'
        ? 'Mixed-Use Commercial'
        : landUse === 'Agricultural'
        ? 'Protected Agricultural Zone'
        : landUse === 'Industrial'
        ? 'Special Economic & Industrial'
        : 'Urban Leasehold Zone',
    leaseTerm: landUse === 'Leasehold' ? '99 Years' : 'N/A',
    sizeSqm,
    hasCondoUnits: isDefaultShowcase,
    rightType: landUse === 'Leasehold' ? 'Emphyteutic Lease' : 'Freehold',
    transactionId: isDefaultShowcase
      ? 'TRX-2024-04821'
      : `TRX-2024-${String(4900 + indexNumber * 17).padStart(5, '0')}`,
    status,
    source,
    date,
    condoDetails: {
      unitUpi: `${upi}-C01`,
      unitIndex: 'C-01',
      flatNo: 'A4',
      floorNo: '2',
      landUse: 'Residential',
      condoType: 'Apartment',
      unitArea: '84.50 sqm',
      rightType: 'Condominium',
      startDate: '2021-06-15',
      startTransactionId: 'TRX-2021-01183',
      endTransactionId: 'N/A',
      isProvisional: 'No',
    },
    condoRights: isDefaultShowcase
      ? [
          {
            id: 'cr-1',
            name: 'MPUNGA JAMES',
            nationalId: generatedNationalId,
            share: '25%',
            phone: '+250 788 412 903',
            address: 'KG 7 Ave, Kimironko, Gasabo',
            representative: 'Mukamana Jeanette',
          },
          {
            id: 'cr-2',
            name: 'NYIRAHABIMANA DOROTHEE',
            nationalId: '1198970052184021',
            share: '25%',
            phone: '+250 788 521 840',
            address: 'KG 11 Ave, Remera, Gasabo',
            representative: 'Self-represented',
          },
          {
            id: 'cr-3',
            name: 'HABIMANA ERIC',
            nationalId: '1199180019283745',
            share: '25%',
            phone: '+250 783 192 837',
            address: 'KK 15 Rd, Niboye, Kicukiro',
            representative: 'Self-represented',
          },
          {
            id: 'cr-4',
            name: 'UWAMAHORO GRACE',
            nationalId: '1199370084729104',
            share: '25%',
            phone: '+250 789 847 291',
            address: 'KN 3 Ave, Kiyovu, Nyarugenge',
            representative: 'Ndayisaba Claude',
          },
        ]
      : [
          {
            id: `cr-${indexNumber}-1`,
            name: owner.toUpperCase(),
            nationalId: generatedNationalId,
            share: '100%',
            phone: `+250 788 ${String(100 + indexNumber).padStart(3, '0')} ${String(200 + indexNumber * 7).slice(0, 3)}`,
            address: `${sector}, ${district}, ${province}`,
            representative: 'Self-represented',
          },
        ],
    previousOwners: [],
    boundaryCorrections: [
      {
        id: 'bc-1',
        upi: '1/03/01/04/3000',
        title: 'Survey discrepancy correction',
        date: '12-Mar-2022',
        status: 'Verified',
      },
      {
        id: 'bc-2',
        upi: '1/03/01/05/1142',
        title: 'Road reserve setback alignment',
        date: '19-Aug-2023',
        status: 'Pending',
      },
    ],
    restrictions: [
      ...(hasCourtCaveat
        ? [
            {
              id: `res-${indexNumber}-1`,
              typeName: 'Caveat — Court Order',
              startDate: '2022-03-14',
              authority: 'Commercial High Court',
            },
          ]
        : []),
      ...(hasTaxSeizure
        ? [
            {
              id: `res-${indexNumber}-2`,
              typeName: 'Seizure — Tax Authority',
              startDate: '2023-08-01',
              authority: 'Rwanda Revenue Authority',
            },
          ]
        : []),
      ...(hasBankruptcy && !isDefaultShowcase
        ? [
            {
              id: `res-${indexNumber}-3`,
              typeName: 'Bankruptcy Restriction',
              startDate: '2024-01-19',
              authority: 'RDB Insolvency Office',
            },
          ]
        : []),
    ],
    mortgages: hasMortgage
      ? [
          {
            id: `mtg-${indexNumber}-1`,
            registrationNo: `MTG-2019-00${4820 + indexNumber}`,
            loanAmountRwf: 45000000,
            lender: 'Bank of Kigali Plc',
            startDate: '2019-05-10',
            status: 'Active',
          },
          ...(isDefaultShowcase
            ? [
                {
                  id: 'mtg-2',
                  registrationNo: 'MTG-2021-007733',
                  loanAmountRwf: 28500000,
                  lender: 'I&M Bank Rwanda',
                  startDate: '2021-11-04',
                  status: 'Active' as const,
                },
                {
                  id: 'mtg-3',
                  registrationNo: 'MTG-2023-011042',
                  loanAmountRwf: 12750000,
                  lender: 'Equity Bank Rwanda',
                  startDate: '2023-02-21',
                  status: 'Active' as const,
                },
              ]
            : []),
        ]
      : [],
    annotations: [
      {
        id: 'ann-1',
        upi,
        text: 'Access road easement — 3 m buffer along northern boundary',
        type: 'Easement Note',
      },
      {
        id: 'ann-2',
        upi,
        text: 'Heritage tree — removal requires environmental approval',
        type: 'Environmental Flag',
      },
      {
        id: 'ann-3',
        upi,
        text: 'Pending survey correction from 2023 field inspection',
        type: 'Survey Remark',
      },
    ],
    transactions: DEFAULT_TRANSACTIONS(upi, province, indexNumber, owner),
    attachments: [
      {
        id: 'att-1',
        fileName: 'Title_Deed_Scan.pdf',
        fileType: 'PDF',
        sizeLabel: '1.2 MB',
        dateLabel: '12 Aug 2024',
        description: 'Official certified title deed scan from district land bureau.',
      },
      {
        id: 'att-2',
        fileName: 'Survey_Report_2024.pdf',
        fileType: 'PDF',
        sizeLabel: '3.4 MB',
        dateLabel: '01 Sep 2024',
        description: 'GIS boundary demarcation and cadastral coordinates report.',
      },
      {
        id: 'att-3',
        fileName: 'ID_Copy_Applicant.jpg',
        fileType: 'IMG',
        sizeLabel: '420 KB',
        dateLabel: '01 Sep 2024',
        description: 'Verified national identification copy of the primary applicant.',
      },
      {
        id: 'att-4',
        fileName: 'Transfer_Agreement.docx',
        fileType: 'DOC',
        sizeLabel: '98 KB',
        dateLabel: '10 Sep 2024',
        description: 'Notarized transfer and right assignment agreement.',
      },
    ],
    comments: [
      {
        id: 'com-1',
        initials: 'EI',
        avatarBg: '#0298D8',
        author: 'Emmanuel I.',
        role: 'Administrator',
        timestampLabel: '2 hrs ago',
        body: 'Application reviewed and all documents verified. Ready for processing.',
      },
      {
        id: 'com-2',
        initials: 'AK',
        avatarBg: '#0EA57A',
        author: 'Alice K.',
        role: 'Land Officer',
        timestampLabel: '1 day ago',
        body: 'Boundary survey report has been attached. Please confirm measurements match the title deed.',
      },
      {
        id: 'com-3',
        initials: 'JPN',
        avatarBg: '#4F5D75',
        author: 'Jean-Pierre N.',
        role: 'Supervisor',
        timestampLabel: '3 days ago',
        body: 'Flagged for secondary review — applicant ID mismatch detected on initial check.',
      },
    ],
    history: [
      { id: 'h-1', status: 'PROCESSING', user: 'vshyirambere', startTimestamp: '18-Dec-2022:12:43:46' },
      { id: 'h-2', status: 'PROCESSED', user: 'vshyirambere', startTimestamp: '08-May-2023:12:12:02' },
      { id: 'h-3', status: 'RETURNED', user: 'ensengiyumva', startTimestamp: '04-Dec-2025:10:40:22' },
      { id: 'h-4', status: 'PROCESSED', user: 'ensengiyumva', startTimestamp: '30-Dec-2025:12:20:51' },
      { id: 'h-5', status: 'RETURNED', user: 'laistesterapprover', startTimestamp: '18-Feb-2026:11:53:15' },
      { id: 'h-6', status: 'PROCESSED', user: 'emmanueliraturinze', startTimestamp: '02-Jun-2026:09:15:33' },
      { id: 'h-7', status: 'APPROVED', user: 'emmanueliraturinze', startTimestamp: '15-Sep-2026:14:22:07' },
    ],
    parents: [
      {
        upi: '1/02/12/08/3200',
        owner: 'Nzeyimana Théogène (Estate)',
        areaSqm: 8750,
        district: 'Gasabo',
        note: 'Subdivided 2019-03-14',
        status: 'Active',
      },
    ],
    children: [
      { upi: '1/02/12/08/3357', owner: 'Hakizimana Eric', areaSqm: 320, status: 'Active' },
      { upi: '1/02/12/08/3358', owner: 'Uwimana Solange', areaSqm: 280, status: 'Active' },
      { upi: '1/02/12/08/3359', owner: 'Bizimana Celestin', areaSqm: 410, status: 'Pending' },
      { upi: '1/02/12/08/3360', owner: 'Murekatete Aline', areaSqm: 350, status: 'Active' },
      { upi: '1/02/12/08/3361', owner: 'Nkurunziza Sylvain', areaSqm: 290, status: 'Active' },
      { upi: '1/02/12/08/3362', owner: 'Mukeshimana Chantal', areaSqm: 365, status: 'Active' },
      { upi: '1/02/12/08/3363', owner: 'Ndagijimana Jean', areaSqm: 310, status: 'Active' },
      { upi: '1/02/12/08/3364', owner: 'Ingabire Diane', areaSqm: 405, status: 'Pending' },
      { upi: '1/02/12/08/3365', owner: 'Tuyishime Olivier', areaSqm: 295, status: 'Active' },
      { upi: '1/02/12/08/3366', owner: 'Uwizeye Claudine', areaSqm: 340, status: 'Active' },
      { upi: '1/02/12/08/3367', owner: 'Niyitegeka Samuel', areaSqm: 380, status: 'Active' },
      { upi: '1/02/12/08/3368', owner: 'Mutoni Fabiola', areaSqm: 315, status: 'Active' },
    ],
    ...overrides,
  };
}

const RAW_SEED: Array<{
  upi: string;
  owner: string;
  province: ProvinceName;
  district: string;
  sector: string;
  cell: string;
  village: string;
  landUse: ParcelRecord['landUse'];
  sizeSqm: number;
  status: KpiStatusKey;
  source: IntegrationSource;
  date: string;
}> = [
  { upi: '1/01/03/02/0891', owner: 'Niyonzima Patrick', province: 'Kigali City', district: 'Gasabo', sector: 'Kimironko', cell: 'Bibare', village: 'Kimironko', landUse: 'Residential', sizeSqm: 560, status: 'Received', source: 'LAIS', date: '2024-07-01' },
  { upi: '1/02/12/08/3356', owner: 'Mpunga James', province: 'Kigali City', district: 'Gasabo', sector: 'Kimironko', cell: 'Kibagabaga', village: 'Kimironko', landUse: 'Residential', sizeSqm: 842.5, status: 'Processing', source: 'IREMBO', date: '2024-07-02' },
  { upi: '1/03/01/04/3000', owner: 'Nyirahabimana Dorothee', province: 'Southern', district: 'Huye', sector: 'Ngoma', cell: 'Butare', village: 'Matyazo', landUse: 'Agricultural', sizeSqm: 1420, status: 'Received', source: 'LAIS', date: '2024-07-03' },
  { upi: '1/02/08/05/1120', owner: 'Habimana Eric', province: 'Kigali City', district: 'Kicukiro', sector: 'Niboye', cell: 'Gatare', village: 'Nyarurama', landUse: 'Commercial', sizeSqm: 780, status: 'Received', source: 'IECMS', date: '2024-07-04' },
  { upi: '1/02/12/08/3200', owner: 'Nzeyimana Théogène', province: 'Kigali City', district: 'Gasabo', sector: 'Kimironko', cell: 'Nyagatovu', village: 'Isano', landUse: 'Residential', sizeSqm: 8750, status: 'Approved', source: 'LAIS', date: '2024-07-05' },
  { upi: '1/01/03/02/0892', owner: 'Uwamahoro Grace', province: 'Kigali City', district: 'Nyarugenge', sector: 'Nyarugenge', cell: 'Kiyovu', village: 'Amahoro', landUse: 'Commercial', sizeSqm: 640, status: 'Booked', source: 'IREMBO', date: '2024-07-06' },
  { upi: '1/04/02/03/2214', owner: 'Bizimana Celestin', province: 'Northern', district: 'Musanze', sector: 'Muhoza', cell: 'Kigombe', village: 'Ruhengeri', landUse: 'Residential', sizeSqm: 495, status: 'Returned', source: 'BPMIS', date: '2024-07-07' },
  { upi: '1/05/01/06/1408', owner: 'Murekatete Aline', province: 'Eastern', district: 'Rwamagana', sector: 'Kigabiro', cell: 'Cyanya', village: 'Nyagasenyi', landUse: 'Agricultural', sizeSqm: 2350, status: 'Completed', source: 'Ubutaka', date: '2024-07-08' },
];

const EXTRA_OWNERS = [
  'Nkurunziza Sylvain',
  'Mukeshimana Chantal',
  'Ndagijimana Jean',
  'Kigali Urban Dev Ltd',
  'Tuyishime Olivier',
  'Uwizeye Claudine',
  'Niyitegeka Samuel',
  'Bank of Kigali Plc',
  'Kamanzi Emmanuel',
  'Mugisha Jean Bosco',
  'Horizon Holdings Ltd',
  'Nsengiyumva Pascal',
  'Rukundo Innocent',
  'Iradukunda Aline',
  'Rwanda Real Estate Corp',
  'Mukamana Jeanette',
];

const STATUS_CYCLE: KpiStatusKey[] = [
  'Received',
  'Booked',
  'Accepted',
  'Processing',
  'Returned',
  'Processed',
  'Approved',
  'Completed',
  'Rejected',
];

// Weighted distribution matching LAIS 18, IREMBO 12, IECMS 7, BPMIS 5, Ubutaka 3, IFMIS 2, RDB 1 (total 48)
const SOURCE_POOL_48: IntegrationSource[] = [
  ...Array(18).fill('LAIS'),
  ...Array(12).fill('IREMBO'),
  ...Array(7).fill('IECMS'),
  ...Array(5).fill('BPMIS'),
  ...Array(3).fill('Ubutaka'),
  ...Array(2).fill('IFMIS'),
  ...Array(1).fill('RDB'),
];

const LAND_USES: ParcelRecord['landUse'][] = [
  'Residential',
  'Residential',
  'Agricultural',
  'Commercial',
  'Industrial',
  'Leasehold',
];

const PROVINCES_LIST: Exclude<ProvinceName, 'National'>[] = [
  'Kigali City',
  'Kigali City',
  'Southern',
  'Western',
  'Northern',
  'Eastern',
];

export const INITIAL_PARCELS: ParcelRecord[] = Array.from({ length: 48 }, (_, idx) => {
  const indexNumber = idx + 1;
  if (idx < RAW_SEED.length) {
    const item = RAW_SEED[idx];
    return createDefaultDetails(
      indexNumber,
      item.upi,
      item.owner,
      item.province,
      item.district,
      item.sector,
      item.cell,
      item.village,
      item.landUse,
      item.sizeSqm,
      item.status,
      item.source,
      item.date,
      item.upi === '1/02/12/08/3356'
        ? {
            transactionId: 'TRX-2024-04821',
            sizeSqm: 842.5,
            village: 'Kimironko',
            plannedLandUse: 'Low Density Residential',
          }
        : undefined
    );
  }

  const prov = PROVINCES_LIST[idx % PROVINCES_LIST.length];
  const distKeys = Object.keys(LOCATION_HIERARCHY[prov]);
  const dist = distKeys[idx % distKeys.length];
  const secKeys = Object.keys(LOCATION_HIERARCHY[prov][dist]);
  const sec = secKeys[idx % secKeys.length];
  const cells = LOCATION_HIERARCHY[prov][dist][sec];
  const cell = cells[idx % cells.length];

  const provCode = prov === 'Kigali City' ? '01' : prov === 'Southern' ? '02' : prov === 'Western' ? '03' : prov === 'Northern' ? '04' : '05';
  const upi = `1/${provCode}/${String((idx % 9) + 1).padStart(2, '0')}/${String((idx % 12) + 1).padStart(2, '0')}/${String(1020 + idx * 37).padStart(4, '0')}`;
  const owner = EXTRA_OWNERS[idx % EXTRA_OWNERS.length];
  const landUse = LAND_USES[idx % LAND_USES.length];
  const source = SOURCE_POOL_48[idx];
  const status = idx < 12 ? 'Received' : STATUS_CYCLE[idx % STATUS_CYCLE.length];
  const day = String(((idx % 28) + 1)).padStart(2, '0');
  const sizeSqm = landUse === 'Agricultural' ? 1200 + (idx % 15) * 90 : 420 + (idx % 14) * 45;

  return createDefaultDetails(
    indexNumber,
    upi,
    owner,
    prov,
    dist,
    sec,
    cell,
    cell,
    landUse,
    sizeSqm,
    status,
    source,
    `2024-07-${day}`
  );
});
