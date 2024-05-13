export interface User {
  // Incomplete type definition, add other properties as needed
  username: React.ReactNode;
  name: string;
  data: {
    roles: string[];
    id: number;
  };
}
