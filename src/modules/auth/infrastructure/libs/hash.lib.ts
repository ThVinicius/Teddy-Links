import * as bcrypt from 'bcrypt';

export class HashLib {
  public static readonly sync = (text: string, salt: number): string => {
    return bcrypt.hashSync(text, salt);
  };

  public static readonly compareSync = (
    text: string,
    hash: string
  ): boolean => {
    return bcrypt.compareSync(text, hash);
  };
}
