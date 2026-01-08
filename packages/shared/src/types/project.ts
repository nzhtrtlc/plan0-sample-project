export type FormState = {
  projectName: string;
  address: string;
  billingEntity: string;
  date: string;
  clientEmail: string;
  clientName: string;
  clientCompanyAddress: string;
  assetClass: string;
  projectDescription: string;
  proposedMandate: ProposedMandate;
};

export type ProposedMandate = "Estimating" | "Proforma" | "Project Monitoring";

export type GeneratePdfInput = FormState & { fee: FeeSummary };

export type Address = {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  fullAddress: string;
};

export type StaffMember = {
  id: string;
  name: string;
  defaultRate: number;
};

export type FeeLine = {
  staffId: string;
  staffName: string;
  hours: number;
  rate: number;
  lineTotal: number;
};

export type FeeSummary = {
  lines: FeeLine[];
  total: number;
};
