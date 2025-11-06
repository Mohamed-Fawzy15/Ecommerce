/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import { TokenService } from '../service/token/token.service';
import { UserRequest } from '../interfaces';
import { TokenType } from '../enums';

export const tokenType = (typeToken: TokenType = TokenType.access) => {
  return (req: UserRequest, res: Response, next: NextFunction) => {
    req.typeToken = typeToken;
    next();
  };
};

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly tokenService: TokenService) {}

  async use(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { authorization } = req.headers;
      const [prefix, token] = authorization?.split(' ') || [];

      if (!prefix || !token) {
        throw new BadRequestException('Token not found');
      }

      const signature = await this.tokenService.GetSignature(
        prefix,
        req.typeToken,
      );
      if (!signature) {
        throw new BadRequestException('Invalid signature');
      }

      const { user, decoded } =
        await this.tokenService.decodedTokenAndFetchUser(token, signature);

      req.user = user;
      req.decoded = decoded;
      return next();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
