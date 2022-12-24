import { applyDecorators, CustomDecorator, SetMetadata, UseGuards } from '@nestjs/common';

import { Role } from '../../users/entities/user.entity';
import { AuthUserGuard } from '../guards/auth-user.guard';

const EmailVerified = (emailVerified: boolean): CustomDecorator => SetMetadata('emailVerified', emailVerified);
const Roles = (...roles: Role[]): CustomDecorator => SetMetadata('roles', roles);

export function AuthUser(emailVerified = false, ...roles: Role[]) {
	return applyDecorators(EmailVerified(emailVerified), Roles(...roles), UseGuards(AuthUserGuard));
}
