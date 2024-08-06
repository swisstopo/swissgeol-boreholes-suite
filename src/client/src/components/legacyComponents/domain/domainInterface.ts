export interface Domains {
  // Incomplete type definition, add other properties as needed
  data: Codelist[];
}

export interface Codelist {
  id: number;
  geolcode: number;
  schema: string;
}
