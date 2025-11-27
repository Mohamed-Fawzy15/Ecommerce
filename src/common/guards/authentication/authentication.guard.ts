/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenName } from 'src/common/decorators';
import { TokenService } from 'src/common/service/token/token.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const typeToken = this.reflector.get(TokenName, context.getHandler());
    let req: any;
    let authorization: string = '';

    if (context.getType() === 'http') {
      req = context.switchToHttp().getRequest();
      authorization = req.headers.authorization;
    } else if (context.getType() === 'ws') {
      req = context.switchToWs().getClient();
      authorization =
        req.handshake.headers.authorization || req.handshake.auth?.token;
    } else if (context.getType() === 'rpc') {
      // Handle RPC context
    }

    try {
      const [prefix, token] = authorization?.split(' ') || [];

      if (!prefix || !token) {
        throw new BadRequestException('Token not found');
      }

      const signature = await this.tokenService.GetSignature(prefix, typeToken);
      if (!signature) {
        throw new BadRequestException('Invalid signature');
      }

      const { user, decoded } =
        await this.tokenService.decodedTokenAndFetchUser(token, signature);

      if (context.getType() === 'ws') {
        req.data = req.data || {};
        req.data.user = user;
        req.data.decoded = decoded;
      } else {
        req.user = user;
        req.decoded = decoded;
      }

      return true;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
