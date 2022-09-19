import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { BadRequestException } from '@nestjs/common';

import { ResetPasswordController } from './reset-password.controller';
import { ResetPasswordService } from './reset-password.service';
import { ResetPasswordDto, SendResetPasswordEmailDto } from './dto';
import { UserNotFoundException } from '../users/exceptions';
import { InvalidTokenException } from './exceptions';

describe('ResetPasswordController', () => {
	let resetPasswordController: ResetPasswordController;
	let resetPasswordService: ResetPasswordService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ResetPasswordController],
			providers: [ResetPasswordService],
		})
			.useMocker(createMock)
			.compile();

		resetPasswordController = module.get<ResetPasswordController>(ResetPasswordController);
		resetPasswordService = module.get<ResetPasswordService>(ResetPasswordService);
	});

	it('should be defined', () => {
		expect(resetPasswordController).toBeInstanceOf(ResetPasswordController);
		expect(resetPasswordController).toBeDefined();
	});

	it('should send a password reset email to a user', async () => {
		const payload: SendResetPasswordEmailDto = { email: 'john@datadvisor.me' };

		resetPasswordService.send = jest.fn().mockResolvedValue({});
		await expect(resetPasswordController.send(payload)).resolves.toBe(undefined);
	});

	it('should not send a password reset email to an unknown user', async () => {
		const payload: SendResetPasswordEmailDto = { email: 'janeth@datadvisor.me' };

		resetPasswordService.send = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(resetPasswordController.send(payload)).resolves.toBe(undefined);
	});

	it('should not send a password reset email when an error occurs', async () => {
		const payload: SendResetPasswordEmailDto = { email: 'janeth@datadvisor.me' };

		resetPasswordService.send = jest.fn().mockRejectedValue(new Error());
		await expect(resetPasswordController.send(payload)).rejects.toThrowError(Error);
	});

	it("should reset a user's password", async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.fyFJ0O5dFEtgOOmkw1Qagmz3yNXn-eIGsEf1uYTQmXk';
		const payload: ResetPasswordDto = { password: 'newpassw0rd' };

		resetPasswordService.reset = jest.fn().mockResolvedValue({});
		await expect(resetPasswordController.reset(token, payload)).resolves.toBe(undefined);
	});

	it('should not reset the password of a user with an invalid or expired token', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.fyFJ0O5dFEtgOOmkw1Qagmz3yNXn-eIGsEf1uYTQmXk';
		const payload: ResetPasswordDto = { password: 'newpassw0rd' };

		resetPasswordService.reset = jest.fn().mockRejectedValue(new InvalidTokenException());
		await expect(resetPasswordController.reset(token, payload)).rejects.toThrowError(BadRequestException);
	});

	it("should not reset a user's password when an error occurs", async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.fyFJ0O5dFEtgOOmkw1Qagmz3yNXn-eIGsEf1uYTQmXk';
		const payload: ResetPasswordDto = { password: 'newpassw0rd' };

		resetPasswordService.reset = jest.fn().mockRejectedValue(new Error());
		await expect(resetPasswordController.reset(token, payload)).rejects.toThrowError(Error);
	});

	it('should not reset the password of an unknown user', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImphbmV0aEBkYXRhZHZpc29yLm1lIiwiaWF0IjoxNjYzNDQyOTU0LCJleHAiOjE2NjM0NDY1NTR9.Li3K6iMyK2jrNXN99gDPHegIrQrzDwbZhSGewd2hXiQ';
		const payload: ResetPasswordDto = { password: 'newpassw0rd' };

		resetPasswordService.reset = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(resetPasswordController.reset(token, payload)).rejects.toThrowError(BadRequestException);
	});
});
