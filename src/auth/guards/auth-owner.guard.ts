import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Role, User } from '../../users/entities/user.entity';

@Injectable()
export class AuthOwnerGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	async canActivate(ctx: ExecutionContext): Promise<boolean> {
		const req = ctx.switchToHttp().getRequest();
		const { user }: { user: User } = req;

		if (!user) {
			throw new UnauthorizedException('You must be logged in to access to this resource');
		}

		const self = this.reflector.get<string>('self', ctx.getHandler());

		if (!self) {
			throw new ForbiddenException("You don't have permission to access to this resource");
		}
		return user.id === req.params[self] || user.role === Role.ADMIN;
	}
}
