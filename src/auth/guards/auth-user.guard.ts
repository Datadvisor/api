import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	forwardRef,
	Inject,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ISession } from '../../session/session.type';
import { Role } from '../../users/entities/user.entity';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';
import { UsersService } from '../../users/users.service';

@Injectable()
export class AuthUserGuard implements CanActivate {
	constructor(
		@Inject(forwardRef(() => UsersService)) private readonly userService: UsersService,
		private reflector: Reflector,
	) {}

	private static checkPermission(roles: string[], userRole: string): boolean {
		return roles.includes(userRole);
	}

	async canActivate(ctx: ExecutionContext): Promise<boolean> {
		const req = ctx.switchToHttp().getRequest();
		const { user }: ISession = req.session;

		if (!user) {
			throw new UnauthorizedException('You must be logged in to access to this resource');
		}

		try {
			req.user = await this.userService.getById(user.id);
		} catch (err) {
			if (err instanceof UserNotFoundException) {
				throw new UnauthorizedException('You must be logged in to access to this resource');
			}
			throw err;
		}

		const emailVerified = this.reflector.get<boolean>('emailVerified', ctx.getHandler());

		if (emailVerified && !req.user.emailVerified) {
			throw new ForbiddenException("You don't have permission to access to this resource");
		}

		const roles = this.reflector.get<Role[]>('roles', ctx.getHandler());

		if (roles && roles.length && !AuthUserGuard.checkPermission(roles, req.user.role)) {
			throw new ForbiddenException("You don't have permission to access to this resource");
		}
		return true;
	}
}
