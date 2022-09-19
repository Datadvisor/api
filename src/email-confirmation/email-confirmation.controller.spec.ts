import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { BadRequestException, ConflictException, GoneException } from '@nestjs/common';

import { EmailConfirmationController } from './email-confirmation.controller';
import { EmailConfirmationService } from './email-confirmation.service';
import { User } from '../users/entities';
import { EmailAlreadyConfirmedException, InvalidTokenException } from './exceptions';
import { UserNotFoundException } from '../users/exceptions';

describe('EmailConfirmationController', () => {
	let emailConfirmationController: EmailConfirmationController;
	let emailConfirmationService: EmailConfirmationService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [EmailConfirmationController],
			providers: [EmailConfirmationService],
		})
			.useMocker(createMock)
			.compile();

		emailConfirmationController = module.get<EmailConfirmationController>(EmailConfirmationController);
		emailConfirmationService = module.get<EmailConfirmationService>(EmailConfirmationService);
	});

	it('should be defined', () => {
		expect(emailConfirmationController).toBeInstanceOf(EmailConfirmationController);
		expect(emailConfirmationController).toBeDefined();
	});

	it('should send a confirmation email to a user', async () => {
		const user: User = {
			id: 'cl86azi1n0004mryy0j7p0mrv',
			lastName: 'Doe',
			firstName: 'John',
			email: 'john@datadvisor.me',
			password: '$2a$10$eQiKBbTlFwuZntlB7ioGUelCLGn.Mn13OJ4HXVWiGR8YuIyLBpNnK',
			role: 'UNCONFIRMED_USER',
			createdAt: new Date('2022-09-17T19:29:14.267Z'),
			updatedAt: new Date('2022-09-17T19:29:14.268Z'),
		};

		emailConfirmationService.send = jest.fn().mockResolvedValue({});
		await expect(emailConfirmationController.send(user)).resolves.toBe(undefined);
	});

	it('should not send a confirmation email to an already confirmed user', async () => {
		const user: User = {
			id: 'cl86azi1n0004mryy0j7p0mrv',
			lastName: 'Doe',
			firstName: 'John',
			email: 'john@datadvisor.me',
			password: '$2a$10$eQiKBbTlFwuZntlB7ioGUelCLGn.Mn13OJ4HXVWiGR8YuIyLBpNnK',
			role: 'USER',
			createdAt: new Date('2022-09-17T19:29:14.267Z'),
			updatedAt: new Date('2022-09-17T19:29:14.268Z'),
		};

		emailConfirmationService.send = jest.fn().mockRejectedValue(new EmailAlreadyConfirmedException());
		await expect(emailConfirmationController.send(user)).rejects.toThrowError(ConflictException);
	});

	it('should not send a confirmation email when an error occurs', async () => {
		const user: User = {
			id: 'cl86azi1n0004mryy0j7p0mrv',
			lastName: 'Doe',
			firstName: 'John',
			email: 'john@datadvisor.me',
			password: '$2a$10$eQiKBbTlFwuZntlB7ioGUelCLGn.Mn13OJ4HXVWiGR8YuIyLBpNnK',
			role: 'USER',
			createdAt: new Date('2022-09-17T19:29:14.267Z'),
			updatedAt: new Date('2022-09-17T19:29:14.268Z'),
		};

		emailConfirmationService.send = jest.fn().mockRejectedValue(new Error());
		await expect(emailConfirmationController.send(user)).rejects.toThrowError(Error);
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
		await expect(emailConfirmationController.confirm(token)).rejects.toThrowError(GoneException);
	});

	it('should not confirm a user with an invalid or expired token', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.zjiN9lHFh__ZGdDx5VaWu5QplenTUq7mWEbrcOplPpo';

		emailConfirmationService.confirm = jest.fn().mockRejectedValue(new InvalidTokenException());
		await expect(emailConfirmationController.confirm(token)).rejects.toThrowError(BadRequestException);
	});

	it('should not confirm an unknown user', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImphbmV0aEBkYXRhZHZpc29yLm1lIiwiaWF0IjoxNjYzNDQyOTU0LCJleHAiOjE2NjM0NDY1NTR9.Li3K6iMyK2jrNXN99gDPHegIrQrzDwbZhSGewd2hXiQ';

		emailConfirmationService.confirm = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(emailConfirmationController.confirm(token)).rejects.toThrowError(BadRequestException);
	});

	it('should not confirm a user when an error occurs', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImphbmV0aEBkYXRhZHZpc29yLm1lIiwiaWF0IjoxNjYzNDQyOTU0LCJleHAiOjE2NjM0NDY1NTR9.Li3K6iMyK2jrNXN99gDPHegIrQrzDwbZhSGewd2hXiQ';

		emailConfirmationService.confirm = jest.fn().mockRejectedValue(new Error());
		await expect(emailConfirmationController.confirm(token)).rejects.toThrowError(Error);
	});
});
