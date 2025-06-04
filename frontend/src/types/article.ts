export interface Article {
  _id: string;
  title: string;
  author: string | string[];
  published_date: string;
  description?: string;
  publisher?: string;
  status?: string;
  isbn?: string;
  moderatedBy?: string;
  rating?: number | string;
  reason_for_decision?: string;
  volume?: string;
  number?: number;
  journal?: string;
  updated_date?: string;
  moderated_date?: string;
  practice?: string[];
  claim?: string[];
  practiceIds?: string[];
  claimIds?: string[];
  doi?: string;
}

export interface Practice {
  _id: string;
  name: string;
  valid: boolean;
}

export interface Claim {
  _id: string;
  name: string;
  valid: boolean;
}

export interface RatingSummary {
  averageRating: number;
  ratingCount: number;
}

export interface TableHeader {
  key: string;
  label: string;
}

export interface FilterOptions {
  statusOptions: string[];
  practiceOptions: string[];
  claimOptions: string[];
}