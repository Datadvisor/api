import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import * as cuid from 'cuid';
import { faker } from '@faker-js/faker/locale/en';
import { hash } from 'bcrypt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import { EmailConfirmationService } from './email-confirmation.service';
import { EmailService } from '../email';
import { UsersService } from '../users';
import { Role, User } from '../users/entities';
import { EmailAlreadyConfirmedException, InvalidTokenException } from './exceptions';
import { EmailConfirmationTokenPayloadType } from './email-confirmation.type';
import { UserNotFoundException } from '../users/exceptions';

describe('EmailConfirmationService', () => {
	let emailConfirmationService: EmailConfirmationService;
	let configService: ConfigService;
	let jwtService: JwtService;
	let emailService: EmailService;
	let usersService: UsersService;

	let user: User;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				EmailConfirmationService,
				{
					provide: ConfigService,
					useValue: {
						get(key: string) {
							const env = {
								'api.frontend.url': 'https://datadvisor.me',
								'api.saltRounds': 10,
								'api.email-confirmation.emailTemplatePath': 'views/email-confirmation-email.view.ejs',
								'api.email.senderName': 'Datadvisor',
								'api.email.senderEmail': 'noreply@datadvisor.me',
							};

							return env[key];
						},
					},
				},
			],
		})
			.useMocker(createMock)
			.compile();

		emailConfirmationService = module.get<EmailConfirmationService>(EmailConfirmationService);
		configService = module.get<ConfigService>(ConfigService);
		jwtService = module.get<JwtService>(JwtService);
		emailService = module.get<EmailService>(EmailService);
		usersService = module.get<UsersService>(UsersService);
	});

	beforeEach(async () => {
		user = {
			id: cuid(),
			lastName: faker.name.lastName(),
			firstName: faker.name.firstName(),
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
			password: await hash(faker.internet.password(8), configService.get<number>('api.saltRounds')),
			role: Role.UNCONFIRMED_USER,
			createdAt: faker.date.past(),
			updatedAt: faker.date.past(),
		};
	});

	it('should be defined', () => {
		expect(emailConfirmationService).toBeInstanceOf(EmailConfirmationService);
		expect(emailConfirmationService).toBeDefined();
	});

	it('should send a confirmation email to a user', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.zjiN9lHFh__ZGdDx5VaWu5QplenTUq7mWEbrcOplPpo';

		jwtService.signAsync = jest.fn().mockResolvedValue(token);
		emailService.send = jest.fn().mockResolvedValue({});
		await expect(emailConfirmationService.send(user)).resolves.toBe(undefined);
	});

	it('should not send a confirmation email to an already confirmed user', async () => {
		const expectedUser: User = { ...user, role: Role.USER };

		await expect(emailConfirmationService.send(expectedUser)).rejects.toThrow(EmailAlreadyConfirmedException);
	});

	it('should confirm a user', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.zjiN9lHFh__ZGdDx5VaWu5QplenTUq7mWEbrcOplPpo';
		const payload: EmailConfirmationTokenPayloadType = { email: 'john@datadvisor.me' };
		const expectedUser: User = { ...user, role: Role.USER };

		jwtService.verifyAsync = jest.fn().mockResolvedValue(payload);
		usersService.getByEmail = jest.fn().mockResolvedValue(user);
		usersService.updateRole = jest.fn().mockResolvedValue(expectedUser);
		await expect(emailConfirmationService.confirm(token)).resolves.toBe(undefined);
	});

	it('should not confirm an already confirmed user', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.zjiN9lHFh__ZGdDx5VaWu5QplenTUq7mWEbrcOplPpo';
		const payload: EmailConfirmationTokenPayloadType = { email: user.email };
		const expectedUser: User = { ...user, role: Role.USER };

		jwtService.verifyAsync = jest.fn().mockResolvedValue(payload);
		usersService.getByEmail = jest.fn().mockResolvedValue(expectedUser);
		await expect(emailConfirmationService.confirm(token)).rejects.toThrow(EmailAlreadyConfirmedException);
	});

	it('should not confirm a user with an invalid token', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.zjiN9lHFh__ZGdDx5VaWu5QplenTUq7mWEbrcOplPp';

		jwtService.verifyAsync = jest.fn().mockRejectedValue(new JsonWebTokenError(''));
		await expect(emailConfirmationService.confirm(token)).rejects.toThrow(InvalidTokenException);
	});

	it('should not confirm a user with an expired token', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.zjiN9lHFh__ZGdDx5VaWu5QplenTUq7mWEbrcOplPpo';

		jwtService.verifyAsync = jest.fn().mockRejectedValue(new TokenExpiredError('', faker.date.past()));
		await expect(emailConfirmationService.confirm(token)).rejects.toThrow(InvalidTokenException);
	});

	it('should not confirm an unknown user', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImphbmV0aEBkYXRhZHZpc29yLm1lIiwiaWF0IjoxNjYzNDQyOTU0LCJleHAiOjE2NjM0NDY1NTR9.Li3K6iMyK2jrNXN99gDPHegIrQrzDwbZhSGewd2hXiQ';
		const payload: EmailConfirmationTokenPayloadType = {
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
		};

		jwtService.verifyAsync = jest.fn().mockResolvedValue(payload);
		usersService.getByEmail = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(emailConfirmationService.confirm(token)).rejects.toThrow(UserNotFoundException);
	});
});
