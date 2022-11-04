import { applyDecorators, CustomDecorator, SetMetadata, UseGuards } from '@nestjs/common';

import { AuthOwnerGuard, AuthUserGuard } from '../guards';

const SelfLocation = (self: string): CustomDecorator => SetMetadata('self', self);

export function AuthOwner(self = 'id') {
	return applyDecorators(UseGuards(AuthUserGuard), SelfLocation(self), UseGuards(AuthOwnerGuard));
}
