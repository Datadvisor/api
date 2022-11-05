import { faker } from '@faker-js/faker/locale/en';
import { createMock } from '@golevelup/ts-jest';
import { BadRequestException, ConflictException, GoneException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from 'bcrypt';
import * as cuid from 'cuid';

import { Role, User } from '../users/entities/user.entity';
import { UserNotFoundException } from '../users/exceptions/user-not-found.exception';
import { EmailConfirmationController } from './email-confirmation.controller';
import { EmailConfirmationService } from './email-confirmation.service';
import { EmailAlreadyConfirmedException } from './exceptions/email-already-confirmed.exception.ts';
import { InvalidTokenException } from './exceptions/invalid-token.exception';

describe('EmailConfirmationController', () => {
	let emailConfirmationController: EmailConfirmationController;
	let emailConfirmationService: EmailConfirmationService;
	let configService: ConfigService;

	let user: User;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [EmailConfirmationController],
			providers: [
				EmailConfirmationService,
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

		emailConfirmationController = module.get<EmailConfirmationController>(EmailConfirmationController);
		emailConfirmationService = module.get<EmailConfirmationService>(EmailConfirmationService);
		configService = module.get<ConfigService>(ConfigService);
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
		expect(emailConfirmationController).toBeInstanceOf(EmailConfirmationController);
		expect(emailConfirmationController).toBeDefined();
	});

	it('should send a confirmation email to a user', async () => {
		emailConfirmationService.send = jest.fn().mockResolvedValue({});
		await expect(emailConfirmationController.send(user)).resolves.toBe(undefined);
	});

	it('should not send a confirmation email to an already confirmed user', async () => {
		const expectedUser: User = { ...user, role: Role.USER };

		emailConfirmationService.send = jest.fn().mockRejectedValue(new EmailAlreadyConfirmedException());
		await expect(emailConfirmationController.send(expectedUser)).rejects.toThrow(ConflictException);
	});

	it('should not send a confirmation email when an error occurs', async () => {
		emailConfirmationService.send = jest.fn().mockRejectedValue(new Error());
		await expect(emailConfirmationController.send(user)).rejects.toThrow(Error);
	});

	it('should confirm a user', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.zjiN9lHFh__ZGdDx5VaWu5QplenTUq7mWEbrcOplPpo';

		emailConfirmationService.confirm = jest.fn().mockResolvedValue({});
		await expect(emailConfirmationController.confirm(token)).resolves.toBe(undefined);
	});

	it('should not confirm an already confirmed user', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.zjiN9lHFh__ZGdDx5VaWu5QplenTUq7mWEbrcOplPpo';

		emailConfirmationService.confirm = jest.fn().mockRejectedValue(new EmailAlreadyConfirmedException());
		await expect(emailConfirmationController.confirm(token)).rejects.toThrow(GoneException);
	});

	it('should not confirm a user with an invalid token', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.zjiN9lHFh__ZGdDx5VaWu5QplenTUq7mWEbrcOplPp';

		emailConfirmationService.confirm = jest.fn().mockRejectedValue(new InvalidTokenException());
		await expect(emailConfirmationController.confirm(token)).rejects.toThrow(BadRequestException);
	});

	it('should not confirm a user with an expired token', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.zjiN9lHFh__ZGdDx5VaWu5QplenTUq7mWEbrcOplPpo';

		emailConfirmationService.confirm = jest.fn().mockRejectedValue(new InvalidTokenException());
		await expect(emailConfirmationController.confirm(token)).rejects.toThrow(BadRequestException);
	});

	it('should not confirm an unknown user', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImphbmV0aEBkYXRhZHZpc29yLm1lIiwiaWF0IjoxNjYzNDQyOTU0LCJleHAiOjE2NjM0NDY1NTR9.Li3K6iMyK2jrNXN99gDPHegIrQrzDwbZhSGewd2hXiQ';

		emailConfirmationService.confirm = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(emailConfirmationController.confirm(token)).rejects.toThrow(BadRequestException);
	});

	it('should not confirm a user when an error occurs', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.zjiN9lHFh__ZGdDx5VaWu5QplenTUq7mWEbrcOplPpo';

		emailConfirmationService.confirm = jest.fn().mockRejectedValue(new Error());
		await expect(emailConfirmationController.confirm(token)).rejects.toThrow(Error);
	});
});
