export class User {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  status?: string;
  cognitoGroups: string[] | undefined;
  roles: string[];
  tokenExpiration?: number;
}
