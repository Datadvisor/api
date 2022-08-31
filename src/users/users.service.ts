import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcrypt';

import { PostgresService } from '../postgres';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from './entities';
import { UserNotFoundException, UserConflictException } from './exceptions';

@Injectable()
export class UsersService {
	constructor(private readonly configService: ConfigService, private postgres: PostgresService) {}

	async create(payload: CreateUserDto): Promise<User> {
		const { email, password } = payload;
		const hashedPassword = await hash(password, this.configService.get<number>('api.saltRounds'));

		if (await this.postgres.user.findUnique({ where: { email } })) {
			throw new UserConflictException('Email address already associated to another user account');
		}
		return this.postgres.user.create({ data: { ...payload, password: hashedPassword } });
	}

	async getAll(): Promise<User[]> {
		return this.postgres.user.findMany();
	}

	async getById(id: string): Promise<User | null> {
		const user = await this.postgres.user.findUnique({ where: { id } });

		if (!user) {
			throw new UserNotFoundException('User not found');
		}
		return user;
	}

	async getByEmail(email: string): Promise<User | null> {
		const user = await this.postgres.user.findUnique({ where: { email } });

		if (!user) {
			throw new UserNotFoundException('User not found');
		}
		return user;
	}

	async update(id: string, payload: UpdateUserDto): Promise<User | null> {
		const { email, password } = payload;
		const hashedPassword = password
			? await hash(password, this.configService.get<number>('api.saltRounds'))
			: undefined;
		const user = await this.postgres.user.findUnique({ where: { id } });

		if (!user) {
			throw new UserNotFoundException('User not found');
		}

		if (email && (await this.postgres.user.findUnique({ where: { email } }))) {
			throw new UserConflictException('Email address already associated to another user account');
		}
		return this.postgres.user.update({
			where: { id },
			data: { ...payload, ...(hashedPassword ? { password: hashedPassword } : {}) },
		});
	}

	async delete(id: string): Promise<User | null> {
		const user = await this.postgres.user.findUnique({ where: { id } });

		if (!user) {
			throw new UserNotFoundException('User not found');
		}
		return this.postgres.user.delete({ where: { id } });
	}
}
