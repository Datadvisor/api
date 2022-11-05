import { applyDecorators, CustomDecorator, SetMetadata, UseGuards } from '@nestjs/common';

import { Role } from '../../users/entities/user.entity';
import { AuthUserGuard } from '../guards/auth-user.guard';

const Roles = (...roles: Role[]): CustomDecorator => SetMetadata('roles', roles);

export function AuthUser(...roles: Role[]) {
	return applyDecorators(Roles(...roles), UseGuards(AuthUserGuard));
}
