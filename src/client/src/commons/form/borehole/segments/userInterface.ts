export interface User {
  data: UserData;
}

export interface UserData {
  // Incomplete type definition, add other properties as needed
  roles: string[];
  id: number;
  name: string;
  username: string;
}
