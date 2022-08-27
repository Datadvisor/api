import { Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';

import { PostgresService } from '@app/postgres';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from './entities';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
	constructor(private readonly configService: ConfigService, private postgres: PostgresService) {}

	async create(payload: CreateUserDto): Promise<User> {
		return this.postgres.user.create({ data: payload });
	}

	async getAll(): Promise<User[]> {
		return this.postgres.user.findMany();
	}

	async getById(id: string): Promise<User | null> {
		return this.postgres.user.findUnique({ where: { id } });
	}

	async getByEmail(email: string): Promise<User | null> {
		return this.postgres.user.findUnique({ where: { email } });
	}

	async update(id: string, payload: UpdateUserDto): Promise<User | null> {
		const { password } = payload;
		const hashedPassword = password
			? await hash(password, this.configService.get<number>('API_SALT_ROUNDS'))
			: undefined;

		return this.postgres.user.update({
			where: { id },
			data: { ...payload, ...(hashedPassword ? { password: hashedPassword } : {}) },
		});
	}

	async delete(id: string): Promise<User | null> {
		return this.postgres.user.delete({ where: { id } });
	}
}
