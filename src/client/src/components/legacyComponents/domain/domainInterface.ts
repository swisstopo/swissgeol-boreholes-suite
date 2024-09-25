export interface Domains {
  // Incomplete type definition, add other properties as needed
  data: Codelist[];
}

export interface Codelist {
  order: number;
  id: number;
  geolcode: number;
  schema: string;
  de: string;
  en: string;
  fr: string;
  it: string;
  [key: string]: string | number;
}
