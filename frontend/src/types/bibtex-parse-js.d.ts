declare module "bibtex-parse-js" {
  
  export interface EntryTags {
    [field: string]: string;
  }

  export interface BibEntry {
    citationKey: string;
    entryType: string;
    entryTags: EntryTags;
  }

  export function toJSON(bibtex: string): BibEntry[];
}
