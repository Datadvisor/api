import { applyDecorators, CustomDecorator, SetMetadata, UseGuards } from '@nestjs/common';

import { Role } from '../../users/entities';
import { AuthUserGuard } from '../guards';

const Roles = (...roles: Role[]): CustomDecorator => SetMetadata('roles', roles);
const SelfLocation = (self: string): CustomDecorator => SetMetadata('self', self);

export function AuthUser(self = undefined, ...roles: Role[]) {
	return applyDecorators(SelfLocation(self), Roles(...roles), UseGuards(AuthUserGuard));
}
