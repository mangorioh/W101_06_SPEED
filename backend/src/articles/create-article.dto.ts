export class CreateBookDto {
  title: string;
  volume: string;
  journal: string;
  number: number;
  isbn: string;
  author: string;
  description: string;
  DOI: string;
  URL: string;
  published_date: string;
  publisher: string;
  submitter: string;
  updated_date: Date;
  status: string;
  moderatedBy?:string;
  moderated_date: Date;
  reason_for_decision: string;
}