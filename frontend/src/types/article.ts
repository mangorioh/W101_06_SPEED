export interface Article {
  title: string;
  authors: string[];
  journal: string;
  publication_year: number;
  volume?: string;
  number?: string;
  pages?: string;
  doi: string;
}