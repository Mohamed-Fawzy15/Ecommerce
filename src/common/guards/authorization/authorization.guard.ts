/* eslint-disable @typescript-eslint/require-await */
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
import { Observable } from 'rxjs';
import { RoleName } from 'src/common/decorators/role.decorators';
import { UserRole } from 'src/common/enums';
import { TokenService } from 'src/common/service/token/token.service';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const access_roles: UserRole = this.reflector.get(
        RoleName,
        context.getHandler(),
      );

      const req = context.switchToHttp().getRequest();

      if (!access_roles.includes(req.user.role)) {
        throw new BadRequestException();
      }
      return true;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
