import { faker } from '@faker-js/faker/locale/en';
import { createMock } from '@golevelup/ts-jest';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from 'bcrypt';
import * as cuid from 'cuid';

import { Role, User } from '../users/entities/user.entity';
import { UserNotFoundException } from '../users/exceptions/user-not-found.exception';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendResetPasswordEmailDto } from './dto/send-reset-password-email.dto';
import { InvalidTokenException } from './exceptions/invalid-token.exception';
import { ResetPasswordController } from './reset-password.controller';
import { ResetPasswordService } from './reset-password.service';

describe('ResetPasswordController', () => {
	let resetPasswordController: ResetPasswordController;
	let resetPasswordService: ResetPasswordService;
	let configService: ConfigService;

	let user: User;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ResetPasswordController],
			providers: [
				ResetPasswordService,
				{
					provide: ConfigService,
					useValue: {
						get(key: string) {
							const env = {
								'api.saltRounds': 10,
							};

							return env[key];
						},
					},
				},
			],
		})
			.useMocker(createMock)
			.compile();

		resetPasswordController = module.get<ResetPasswordController>(ResetPasswordController);
		resetPasswordService = module.get<ResetPasswordService>(ResetPasswordService);
		configService = module.get<ConfigService>(ConfigService);
	});

	beforeEach(async () => {
		user = {
			id: cuid(),
			lastName: faker.name.lastName(),
			firstName: faker.name.firstName(),
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
			password: await hash(faker.internet.password(8), configService.get<number>('api.saltRounds')),
			role: Role.USER,
			createdAt: faker.date.past(),
			updatedAt: faker.date.past(),
		};
	});

	it('should be defined', () => {
		expect(resetPasswordController).toBeInstanceOf(ResetPasswordController);
		expect(resetPasswordController).toBeDefined();
	});

	it('should send a password reset email to a user', async () => {
		const payload: SendResetPasswordEmailDto = { email: user.email };

		resetPasswordService.send = jest.fn().mockResolvedValue({});
		await expect(resetPasswordController.send(payload)).resolves.toBe(undefined);
	});

	it('should not send a password reset email to an unknown user', async () => {
		const payload: SendResetPasswordEmailDto = {
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
		};

		resetPasswordService.send = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(resetPasswordController.send(payload)).resolves.toBe(undefined);
	});

	it('should not send a password reset email when an error occurs', async () => {
		const payload: SendResetPasswordEmailDto = { email: user.email };

		resetPasswordService.send = jest.fn().mockRejectedValue(new Error());
		await expect(resetPasswordController.send(payload)).rejects.toThrow(Error);
	});

	it("should reset a user's password", async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.zjiN9lHFh__ZGdDx5VaWu5QplenTUq7mWEbrcOplPpo';
		const payload: ResetPasswordDto = { password: faker.internet.password(8) };

		resetPasswordService.reset = jest.fn().mockResolvedValue({});
		await expect(resetPasswordController.reset(token, payload)).resolves.toBe(undefined);
	});

	it('should not reset the password of a user with an invalid token', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.zjiN9lHFh__ZGdDx5VaWu5QplenTUq7mWEbrcOplPp';
		const payload: ResetPasswordDto = { password: faker.internet.password(8) };

		resetPasswordService.reset = jest.fn().mockRejectedValue(new InvalidTokenException());
		await expect(resetPasswordController.reset(token, payload)).rejects.toThrow(BadRequestException);
	});

	it('should not reset the password of a user with an expired token', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.zjiN9lHFh__ZGdDx5VaWu5QplenTUq7mWEbrcOplPpo';
		const payload: ResetPasswordDto = { password: faker.internet.password(8) };

		resetPasswordService.reset = jest.fn().mockRejectedValue(new InvalidTokenException());
		await expect(resetPasswordController.reset(token, payload)).rejects.toThrow(BadRequestException);
	});

	it('should not reset the password of an unknown user', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImphbmV0aEBkYXRhZHZpc29yLm1lIiwiaWF0IjoxNjYzNDQyOTU0LCJleHAiOjE2NjM0NDY1NTR9.Li3K6iMyK2jrNXN99gDPHegIrQrzDwbZhSGewd2hXiQ';
		const payload: ResetPasswordDto = { password: faker.internet.password(8) };

		resetPasswordService.reset = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(resetPasswordController.reset(token, payload)).rejects.toThrow(BadRequestException);
	});

	it("should not reset a user's password when an error occurs", async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.zjiN9lHFh__ZGdDx5VaWu5QplenTUq7mWEbrcOplPpo';
		const payload: ResetPasswordDto = { password: faker.internet.password(8) };

		resetPasswordService.reset = jest.fn().mockRejectedValue(new Error());
		await expect(resetPasswordController.reset(token, payload)).rejects.toThrow(Error);
	});
});
