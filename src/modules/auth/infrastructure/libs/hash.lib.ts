import * as bcrypt from 'bcrypt';

export class HashLib {
  static sync(text: string, saltRounds: number): string {
    return bcrypt.hashSync(text, saltRounds);
  }
}
