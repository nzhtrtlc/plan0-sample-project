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
  proposedMandates: ProposedMandate[];
  service: string,
  fee: FeeSummary,
  bios: Bio[];
};

export type Bio = {
  id: string;
  name: string;
  industry_experience: string;
  accreditations?: string;
};

export type ProposedMandate = "Estimating" | "Proforma" | "Project Monitoring";

export type GeneratePdfInput = FormState;

export type Mandate = {
  id: string;
  name: ProposedMandate;
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
