import { applyDecorators, CustomDecorator, SetMetadata, UseGuards } from '@nestjs/common';

import { AuthOwnerGuard } from '../guards/auth-owner.guard';
import { AuthUserGuard } from '../guards/auth-user.guard';

const EmailVerified = (emailVerified: boolean): CustomDecorator => SetMetadata('emailVerified', emailVerified);
const SelfLocation = (self: string): CustomDecorator => SetMetadata('self', self);

export function AuthOwner(emailVerified = false, self = 'id') {
	return applyDecorators(
		EmailVerified(emailVerified),
		UseGuards(AuthUserGuard),
		SelfLocation(self),
		UseGuards(AuthOwnerGuard),
	);
}
