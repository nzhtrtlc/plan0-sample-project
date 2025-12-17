export type Project = {
  projectName: string;
  address: string;
  billingEntity: string;
  date: string;
  fee: FeeSummary
};

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
