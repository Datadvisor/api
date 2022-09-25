import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cuid from 'cuid';
import { faker } from '@faker-js/faker/locale/en';
import { hash } from 'bcrypt';

import { PostgresService } from '../postgres';
import { Role, User } from '../users/entities';

@Injectable()
export class SeederService {
	constructor(private readonly configService: ConfigService, private readonly postgresService: PostgresService) {}

	async createUsers(n: number, role: Role): Promise<User[]> {
		const users: User[] = [];

		for (let i = 0; i < n; i++) {
			const user: User = {
				id: cuid(),
				lastName: faker.name.lastName(),
				firstName: faker.name.firstName(),
				email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
				password: faker.internet.password(8),
				role,
				createdAt: faker.date.past(),
				updatedAt: faker.date.past(),
			};

			await this.postgresService.user.upsert({
				where: { email: user.email },
				update: {},
				create: {
					...user,
					password: await hash(user.password, this.configService.get<number>('api.saltRounds')),
				},
			});
			users.push(user);
		}
		return users;
	}
}