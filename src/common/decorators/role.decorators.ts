import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums';

export const RoleName = 'access_role';

export const Role = (access_role: UserRole[]) => {
  return SetMetadata(RoleName, access_role);
};
