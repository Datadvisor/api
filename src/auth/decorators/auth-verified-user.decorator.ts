import { applyDecorators, UseGuards } from '@nestjs/common';

import { AuthUserGuard } from '../guards/auth-user.guard';
import { AuthVerifiedUserGuard } from '../guards/auth-verified-user.guard';

export function AuthVerifiedUser() {
	return applyDecorators(UseGuards(AuthUserGuard), UseGuards(AuthVerifiedUserGuard));
}
