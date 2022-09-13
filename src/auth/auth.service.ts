import { Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';

import { UsersService } from '../users';
import { SignupDto } from './dto';
import { SigninDto } from './dto';
import { User } from '../users/entities';
import { UnauthorizedAuthException } from './exceptions';

@Injectable()
export class AuthService {
	constructor(private readonly userService: UsersService) {}

	async signup(payload: SignupDto): Promise<User | null> {
		return this.userService.create(payload);
	}

	async signin(payload: SigninDto): Promise<User | null> {
		const { email, password } = payload;
		const user = await this.userService.getByEmail(email);

		if (!(await compare(password, user.password))) {
			throw new UnauthorizedAuthException('Invalid username or password');
		}
		return user;
	}
}
