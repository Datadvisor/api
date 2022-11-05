import { Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { UnauthorizedAuthException } from './exceptions/unauthorized-auth.exception';

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
