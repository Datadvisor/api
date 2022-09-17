import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcrypt';

import { PostgresService } from '../postgres';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User, Role } from './entities';
import { UserNotFoundException, UserConflictException } from './exceptions';
import { EmailConfirmationService } from '../email-confirmation';

@Injectable()
export class UsersService {
	constructor(
		private readonly configService: ConfigService,
		private readonly postgresService: PostgresService,
		@Inject(forwardRef(() => EmailConfirmationService))
		private readonly emailConfirmationService: EmailConfirmationService,
	) {}

	async create(payload: CreateUserDto): Promise<User> {
		const { email, password } = payload;
		const hashedPassword = await hash(password, this.configService.get<number>('api.saltRounds'));

		if (await this.postgresService.user.findUnique({ where: { email } })) {
			throw new UserConflictException('Email address already associated to another user account');
		}

		const user = await this.postgresService.user.create({ data: { ...payload, password: hashedPassword } });

		try {
			await this.emailConfirmationService.send(user);
		} catch (err) {}
		return user;
	}

	async getAll(): Promise<User[]> {
		return this.postgresService.user.findMany();
	}

	async getById(id: string): Promise<User | null> {
		const user = await this.postgresService.user.findUnique({ where: { id } });

		if (!user) {
			throw new UserNotFoundException('User not found');
		}
		return user;
	}

	async getByEmail(email: string): Promise<User | null> {
		const user = await this.postgresService.user.findUnique({ where: { email } });

		if (!user) {
			throw new UserNotFoundException('User not found');
		}
		return user;
	}

	async update(id: string, payload: UpdateUserDto): Promise<User | null> {
		const hashedPassword = payload.password
			? await hash(payload.password, this.configService.get<number>('api.saltRounds'))
			: undefined;
		const user = await this.postgresService.user.findUnique({ where: { id } });

		if (!user) {
			throw new UserNotFoundException('User not found');
		}

		if (payload.email && (await this.postgresService.user.findUnique({ where: { email: payload.email } }))) {
			throw new UserConflictException('Email address already associated to another user account');
		}
		return this.postgresService.user.update({
			where: { id },
			data: { ...payload, ...(hashedPassword ? { password: hashedPassword } : {}) },
		});
	}

	async updateRole(id: string, role: Role): Promise<void> {
		const user = await this.postgresService.user.findUnique({ where: { id } });

		if (!user) {
			throw new UserNotFoundException('User not found');
		}
		await this.postgresService.user.update({
			data: { role },
			where: { id },
		});
	}

	async delete(id: string): Promise<User | null> {
		const user = await this.postgresService.user.findUnique({ where: { id } });

		if (!user) {
			throw new UserNotFoundException('User not found');
		}
		return this.postgresService.user.delete({ where: { id } });
	}
}
