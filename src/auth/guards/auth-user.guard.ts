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

import { UsersService } from '../../users';
import { ISession } from '../../session';
import { UserNotFoundException } from '../../users/exceptions';
import { Role } from '../../users/entities';

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

		const self = this.reflector.get<string>('self', ctx.getHandler());

		if (self && req.user.id != req.params[self] && req.user.role != Role.ADMIN) {
			throw new ForbiddenException("You don't have permission to access to this resource");
		}

		const roles = this.reflector.get<Role[]>('roles', ctx.getHandler());

		if (roles && roles.length && !AuthUserGuard.checkPermission(roles, req.user.role)) {
			throw new ForbiddenException("You don't have permission to access to this resource");
		}
		return true;
	}
}
