import { SetMetadata } from '@nestjs/common';
import { TokenType } from '../enums';

export const TokenName = 'typeToken';

export const Token = (typeToken: TokenType = TokenType.access) => {
  return SetMetadata(TokenName, typeToken);
};
