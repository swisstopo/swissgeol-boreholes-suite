export interface Layer {
  queryable: boolean;
  CRS: string[];
  Title: string;
  Abstract: string;
  Name?: string;
  Identifier?: string;
}
