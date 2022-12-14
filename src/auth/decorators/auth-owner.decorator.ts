import { applyDecorators, CustomDecorator, SetMetadata, UseGuards } from '@nestjs/common';

import { AuthOwnerGuard } from '../guards/auth-owner.guard';
import { AuthUserGuard } from '../guards/auth-user.guard';

const SelfLocation = (self: string): CustomDecorator => SetMetadata('self', self);

export function AuthOwner(self = 'id') {
	return applyDecorators(UseGuards(AuthUserGuard), SelfLocation(self), UseGuards(AuthOwnerGuard));
}
