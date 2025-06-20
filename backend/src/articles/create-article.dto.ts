export class CreateArticleDto {
  title: string;
  volume: string;
  journal: string;
  number: number;
  isbn: string;
  author: string[];
  description: string;
  DOI: string;
  URL: string;
  published_date: Date;
  publisher: string;
  submitter: string;
  updated_date: Date;
  status: string;
  moderatedBy: string;
  moderated_date: Date;
  reason_for_decision: string;
  rating: number;
  rating_sum: number;
  rating_count: number;
  practice: string[];
  claim?: string; 
}
