import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';

@Injectable()
export class IdGeneratorLib {
  static readonly generateId = (size: number): string => {
    return nanoid(size);
  };
}
