export interface Codelist {
  order: number;
  id: number;
  geolcode: number;
  schema: string;
  de: string;
  en: string;
  fr: string;
  it: string;
  conf: string;
  [key: string]: string | number;
}
