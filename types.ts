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
}