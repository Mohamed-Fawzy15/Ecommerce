import { applyDecorators, UseGuards } from '@nestjs/common';
import { Token } from './token.decorators';
import { AuthenticationGuard, AuthorizationGuard } from '../guards';
import { TokenType, UserRole } from '../enums';
import { Role } from './role.decorators';

export function Auth({
  typeToken = TokenType.access,
  role = [UserRole.user],
}: {
  typeToken?: TokenType;
  role?: UserRole[];
} = {}) {
  return applyDecorators(
    Token(typeToken),
    Role(role),
    UseGuards(AuthenticationGuard, AuthorizationGuard),
  );
}
