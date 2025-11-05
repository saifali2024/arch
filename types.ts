export interface Attachment {
  name: string;
  type: string;
  data: string; // base64 encoded string
}

export interface RetirementRecord {
  id: string; // Composite key: `${ministry}-${departmentName}-${year}-${month}`
  ministry: string;
  fundingType: string;
  departmentName: string;
  year: number;
  month: number;
  totalSalaries: number;
  employeeCount: number;
  deduction10: number;
  deduction15: number;
  deduction25: number;
  attachments?: Attachment[];
  submittedAt: string; // ISO string for timestamping submission
}

export interface Permissions {
  canEnterData: boolean;
  canQueryData: boolean;
  canViewStats: boolean;
  canViewUnpaid: boolean;
  canEditDelete: boolean;
  canViewClassification: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  passwordHash: string; // NOTE: In a real app, this should be a secure server-side hash.
  role: 'admin' | 'user';
  permissions: Permissions;
}