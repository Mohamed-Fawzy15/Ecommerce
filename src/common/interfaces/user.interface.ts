import { HUserDocument } from 'DB';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { TokenType } from '../enums';

export interface UserRequest extends Request {
  user: HUserDocument;
  decoded: JwtPayload;
  typeToken?: TokenType;
}
