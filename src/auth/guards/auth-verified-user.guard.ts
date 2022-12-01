import { CanActivate, ExecutionContext, forwardRef, Inject, Injectable } from '@nestjs/common';

import { ISession } from '../../session/session.type';
import { UsersService } from '../../users/users.service';

@Injectable()
export class AuthVerifiedUserGuard implements CanActivate {
	constructor(@Inject(forwardRef(() => UsersService)) private readonly userService: UsersService) {}

	async canActivate(ctx: ExecutionContext): Promise<boolean> {
		const req = ctx.switchToHttp().getRequest();
		const { user }: ISession = req.session;

		req.user = await this.userService.getById(user.id);
		return req.user.emailVerified;
	}
}
