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
      authorization = req.headers.authurzation;
    }
    // else if(context.getType() === 'ws'){

    // }else if(context.getType() === 'rpc'){

    // }

    try {
      const { authorization } = req.headers;
      const [prefix, token] = authorization?.split(' ') || [];

      if (!prefix || !token) {
        throw new BadRequestException('Token not found');
      }

      const signature = await this.tokenService.GetSignature(prefix);
      if (!signature) {
        throw new BadRequestException('Invalid signature');
      }

      const { user, decoded } =
        await this.tokenService.decodedTokenAndFetchUser(token, signature);

      req.user = user;
      req.decoded = decoded;
      return true;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
