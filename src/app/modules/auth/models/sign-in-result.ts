import { SignInOutput } from '@aws-amplify/auth';

export class SignInResult {
  result!: boolean;
  error: any;
  cognitoUser: any;
  signInOutput?: SignInOutput | null;
}
