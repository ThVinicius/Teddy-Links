import { Credentials } from '../types/credentials.type';

export interface IAuthService {
  verifyCredentials(email: string, password: string): Promise<Credentials>;
}
