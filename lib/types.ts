export type Dataset = {
  company: string;
  requirements: string;
  sender?: string;
  senderKana?: string;
  senderEnglish?: string;
  position?: string;
  groupName?: string;
  createdAt?: string;
};

export type ApplicantInput = {
  id: string;
  name: string;
  skills: string[];
  [key: string]: any;
};

export type ProcessedCSVData = {
  [key: string]: {
    name: string;
    skills: string[];
    [key: string]: any;
  };
};

export interface ApplicantData {
  applicants: ApplicantInput[];
  source: 'csv' | 'text';
} 