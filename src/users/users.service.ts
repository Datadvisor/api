import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcrypt';

import { PostgresService } from '../postgres';
import { CreateUserDto, UpdateUserDto, UpdateUserPreferencesDto } from './dto';
import { User, Role, Preferences } from './entities';
import { UserNotFoundException, UserConflictException } from './exceptions';
import { EmailConfirmationService } from '../email-confirmation';
import { SubscriberConflictException } from '../newsletter/exceptions';
import { NewsletterService } from '../newsletter';

@Injectable()
export class UsersService {
	private readonly logger = new Logger(UsersService.name);

	constructor(
		private readonly configService: ConfigService,
		private readonly postgresService: PostgresService,
		@Inject(forwardRef(() => EmailConfirmationService))
		private readonly emailConfirmationService: EmailConfirmationService,
		private readonly newsletterService: NewsletterService,
	) {}

	async create(payload: CreateUserDto): Promise<User> {
		const { lastName, firstName, email, password, newsletter } = payload;
		const hashedPassword = await hash(password, this.configService.get<number>('api.saltRounds'));

		if (await this.postgresService.user.findUnique({ where: { email } })) {
			throw new UserConflictException('Email address already associated to another user account');
		}

		const user = await this.postgresService.user.create({
			data: {
				lastName,
				firstName,
				email,
				password: hashedPassword,
				preferences: {
					create: {
						newsletter: false,
					},
				},
			},
		});

		try {
			if (newsletter) {
				await this.updatePreferences(user.id, { newsletter: true });
			}
		} catch (err) {
			if (!(err instanceof SubscriberConflictException)) {
				this.logger.error(err.message);
			}
		}

		try {
			await this.emailConfirmationService.send(user);
		} catch (err) {
			this.logger.error(err.message);
		}
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

	async getPreferences(userId: string): Promise<Preferences | null> {
		const user = await this.postgresService.user.findUnique({ where: { id: userId } });

		if (!user) {
			throw new UserNotFoundException('User not found');
		}
		return this.postgresService.preferences.findUnique({
			where: { userId },
		});
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

	async updateRole(id: string, role: Role): Promise<User | null> {
		const user = await this.postgresService.user.findUnique({ where: { id } });

		if (!user) {
			throw new UserNotFoundException('User not found');
		}
		return this.postgresService.user.update({
			data: { role },
			where: { id },
		});
	}

	async updatePreferences(userId: string, payload: UpdateUserPreferencesDto): Promise<Preferences | null> {
		const user = await this.postgresService.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new UserNotFoundException('User not found');
		}

		if (payload.newsletter !== undefined) {
			if (payload.newsletter) {
				await this.newsletterService.subscribe(user.email);
			} else {
				await this.newsletterService.unsubscribe(user.email);
			}
		}
		return this.postgresService.preferences.update({
			where: { userId },
			data: payload,
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
