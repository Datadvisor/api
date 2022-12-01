import { faker } from '@faker-js/faker/locale/en';
import { createMock } from '@golevelup/ts-jest';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from 'bcrypt';
import * as cuid from 'cuid';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import { EmailService } from '../email/email.service';
import { Role, User } from '../users/entities/user.entity';
import { UserNotFoundException } from '../users/exceptions/user-not-found.exception';
import { UsersService } from '../users/users.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendResetPasswordEmailDto } from './dto/send-reset-password-email.dto';
import { InvalidTokenException } from './exceptions/invalid-token.exception';
import { ResetPasswordService } from './reset-password.service';
import { ResetPasswordTokenPayloadType } from './reset-password.type';

describe('ResetPasswordService', () => {
	let resetPasswordService: ResetPasswordService;
	let configService: ConfigService;
	let jwtService: JwtService;
	let emailService: EmailService;
	let usersService: UsersService;

	let user: User;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ResetPasswordService,
				{
					provide: ConfigService,
					useValue: {
						get(key: string) {
							const env = {
								'api.frontend.url': 'https://datadvisor.me',
								'api.saltRounds': 10,
								'api.reset-password.emailTemplatePath': 'views/reset-password-email.view.ejs',
								'api.reset-password.jwtSecret': 's3cr3t',
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

		resetPasswordService = module.get<ResetPasswordService>(ResetPasswordService);
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
			emailVerified: true,
			password: await hash(faker.internet.password(8), configService.get<number>('api.saltRounds')),
			role: Role.USER,
			createdAt: faker.date.past(),
			updatedAt: faker.date.past(),
		};
	});

	it('should be defined', () => {
		expect(resetPasswordService).toBeInstanceOf(ResetPasswordService);
		expect(resetPasswordService).toBeDefined();
	});

	it('should send a password reset email to a user', async () => {
		const payload: SendResetPasswordEmailDto = { email: 'john@datadvisor.me' };
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.zjiN9lHFh__ZGdDx5VaWu5QplenTUq7mWEbrcOplPpo';

		jwtService.signAsync = jest.fn().mockResolvedValue(token);
		usersService.getByEmail = jest.fn().mockResolvedValue(user);
		emailService.send = jest.fn().mockResolvedValue({});
		await expect(resetPasswordService.send(payload)).resolves.toBe(undefined);
	});

	it('should not send a password reset email to an unknown user', async () => {
		const payload: SendResetPasswordEmailDto = {
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
		};

		usersService.getByEmail = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(resetPasswordService.send(payload)).rejects.toThrow(UserNotFoundException);
	});

	it("should reset a user's password", async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.zjiN9lHFh__ZGdDx5VaWu5QplenTUq7mWEbrcOplPpo';
		const jwtPayload: ResetPasswordTokenPayloadType = { email: user.email };
		const payload: ResetPasswordDto = { password: faker.internet.password(8) };
		const expectedUser: User = {
			...user,
			password: await hash(payload.password, configService.get<number>('api.saltRounds')),
		};

		jwtService.decode = jest.fn().mockResolvedValue(jwtPayload);
		usersService.getByEmail = jest.fn().mockResolvedValue(user);
		jwtService.verifyAsync = jest.fn().mockResolvedValue(jwtPayload);
		usersService.update = jest.fn().mockResolvedValue(expectedUser);
		await expect(resetPasswordService.reset(token, payload)).resolves.toBe(undefined);
	});

	it('should not reset the password of a user with an invalid token', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.zjiN9lHFh__ZGdDx5VaWu5QplenTUq7mWEbrcOplPp';
		const jwtPayload: ResetPasswordTokenPayloadType = { email: user.email };
		const payload: ResetPasswordDto = { password: faker.internet.password(8) };

		jwtService.decode = jest.fn().mockResolvedValue(jwtPayload);
		usersService.getByEmail = jest.fn().mockResolvedValue(user);
		jwtService.verifyAsync = jest.fn().mockRejectedValue(new JsonWebTokenError(''));
		await expect(resetPasswordService.reset(token, payload)).rejects.toThrow(InvalidTokenException);
	});

	it('should not reset the password of a user with an expired token', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.zjiN9lHFh__ZGdDx5VaWu5QplenTUq7mWEbrcOplPpo';
		const jwtPayload: ResetPasswordTokenPayloadType = { email: user.email };
		const payload: ResetPasswordDto = { password: faker.internet.password(8) };

		jwtService.decode = jest.fn().mockResolvedValue(jwtPayload);
		usersService.getByEmail = jest.fn().mockResolvedValue(user);
		jwtService.verifyAsync = jest.fn().mockRejectedValue(new TokenExpiredError('', new Date()));
		await expect(resetPasswordService.reset(token, payload)).rejects.toThrow(InvalidTokenException);
	});

	it('should not reset the password of an unknown user', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImphbmV0aEBkYXRhZHZpc29yLm1lIiwiaWF0IjoxNjYzNDQyOTU0LCJleHAiOjE2NjM0NDY1NTR9.Li3K6iMyK2jrNXN99gDPHegIrQrzDwbZhSGewd2hXiQ';
		const jwtPayload: ResetPasswordTokenPayloadType = { email: user.email };
		const payload: ResetPasswordDto = { password: faker.internet.password(8) };

		jwtService.decode = jest.fn().mockResolvedValue(jwtPayload);
		usersService.getByEmail = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(resetPasswordService.reset(token, payload)).rejects.toThrow(UserNotFoundException);
	});
});
