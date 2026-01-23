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
  listOfServices: string[];
  fee: FeeSummary;
  bios: Bio[];
};

export type Bio = {
  id: string;
  name: string;
};

export type ProposedMandate = "Estimating" | "Proforma" | "Project Monitoring";

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

export type GenerateProposalPayload = {
  projectName: string;
  billingEntity: string;
  date: string;
  clientEmail: string;
  clientName: string;
  clientCompanyAddress: string;
  assetClass: string;
  projectDescription: string;
  address: string;
  fee: FeeSummary;
  proposedMandates: ProposedMandate[];
  listOfServices: string[];
  bios: string[]; // array of bio IDs
};

export type Mandate = {
  id: string;
  name: ProposedMandate;
  defaultRate: number;
};


export enum Division {
  key_cost_consulting_staff = "KEY COST CONSULTING STAFF",
  development_cost_monitoring = "DEVELOPMENT & COST MONITORING",
  cost_estimating = "COST ESTIMATING"
}