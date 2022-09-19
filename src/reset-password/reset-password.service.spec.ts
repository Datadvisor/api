import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { createMock } from '@golevelup/ts-jest';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import { ResetPasswordService } from './reset-password.service';
import { EmailService } from '../email';
import { UsersService } from '../users';
import { ResetPasswordDto, SendResetPasswordEmailDto } from './dto';
import { User } from '../users/entities';
import { UserNotFoundException } from '../users/exceptions';
import { InvalidTokenException } from './exceptions';
import { ResetPasswordTokenPayloadType } from './reset-password.type';

describe('ResetPasswordService', () => {
	let resetPasswordService: ResetPasswordService;
	let jwtService: JwtService;
	let emailService: EmailService;
	let usersService: UsersService;

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
		jwtService = module.get<JwtService>(JwtService);
		emailService = module.get<EmailService>(EmailService);
		usersService = module.get<UsersService>(UsersService);
	});

	it('should be defined', () => {
		expect(resetPasswordService).toBeInstanceOf(ResetPasswordService);
		expect(resetPasswordService).toBeDefined();
	});

	it('should send a password reset email to a user', async () => {
		const payload: SendResetPasswordEmailDto = { email: 'john@datadvisor.me' };
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

		jwtService.signAsync = jest
			.fn()
			.mockResolvedValue(
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.fyFJ0O5dFEtgOOmkw1Qagmz3yNXn-eIGsEf1uYTQmXk',
			);
		usersService.getByEmail = jest.fn().mockResolvedValue(user);
		emailService.send = jest.fn().mockResolvedValue({});
		await expect(resetPasswordService.send(payload)).resolves.toBe(undefined);
	});

	it('should not send a password reset email to an unknown user', async () => {
		const payload: SendResetPasswordEmailDto = { email: 'janeth@datadvisor.me' };

		usersService.getByEmail = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(resetPasswordService.send(payload)).rejects.toThrowError(UserNotFoundException);
	});

	it("should reset a user's password", async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.fyFJ0O5dFEtgOOmkw1Qagmz3yNXn-eIGsEf1uYTQmXk';
		const jwtPayload: ResetPasswordTokenPayloadType = { email: 'john@datadvisor.me' };
		const payload: ResetPasswordDto = { password: 'newpassw0rd' };
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
		const updatedUser: User = {
			id: 'cl86azi1n0004mryy0j7p0mrv',
			lastName: 'Doe',
			firstName: 'John',
			email: 'john@datadvisor.me',
			password: '$2a$10$eQiKBbTlFwuZntlB7ioGUelCLGn.Mn13OJ4HXVWiGR8YuIyLBpNnK',
			role: 'USER',
			createdAt: new Date('2022-09-17T19:29:14.267Z'),
			updatedAt: new Date('2022-09-17T19:29:14.268Z'),
		};

		jwtService.decode = jest.fn().mockResolvedValue(jwtPayload);
		usersService.getByEmail = jest.fn().mockResolvedValue(user);
		jwtService.verifyAsync = jest.fn().mockResolvedValue(jwtPayload);
		usersService.update = jest.fn().mockResolvedValue(updatedUser);
		await expect(resetPasswordService.reset(token, payload)).resolves.toBe(undefined);
	});

	it('should not reset the password of a user with an invalid token', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.fyFJ0O5dFEtgOOmkw1Qagmz3yNXn-eIGsEf1uYTQmXk';
		const jwtPayload: ResetPasswordTokenPayloadType = { email: 'john@datadvisor.me' };
		const payload: ResetPasswordDto = { password: 'newpassw0rd' };
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

		jwtService.decode = jest.fn().mockResolvedValue(jwtPayload);
		usersService.getByEmail = jest.fn().mockResolvedValue(user);
		jwtService.verifyAsync = jest.fn().mockRejectedValue(new JsonWebTokenError(''));
		await expect(resetPasswordService.reset(token, payload)).rejects.toThrowError(InvalidTokenException);
	});

	it('should not reset the password of a user with an expired token', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZGF0YWR2aXNvci5tZSIsImlhdCI6MTY2MzQ0Mjk1NCwiZXhwIjoxNjYzNDQ2NTU0fQ.fyFJ0O5dFEtgOOmkw1Qagmz3yNXn-eIGsEf1uYTQmXk';
		const jwtPayload: ResetPasswordTokenPayloadType = { email: 'john@datadvisor.me' };
		const payload: ResetPasswordDto = { password: 'newpassw0rd' };
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

		jwtService.decode = jest.fn().mockResolvedValue(jwtPayload);
		usersService.getByEmail = jest.fn().mockResolvedValue(user);
		jwtService.verifyAsync = jest.fn().mockRejectedValue(new TokenExpiredError('', new Date()));
		await expect(resetPasswordService.reset(token, payload)).rejects.toThrowError(InvalidTokenException);
	});

	it('should not reset the password of an unknown user', async () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImphbmV0aEBkYXRhZHZpc29yLm1lIiwiaWF0IjoxNjYzNDQyOTU0LCJleHAiOjE2NjM0NDY1NTR9.Li3K6iMyK2jrNXN99gDPHegIrQrzDwbZhSGewd2hXiQ';
		const jwtPayload: ResetPasswordTokenPayloadType = { email: 'janeth@datadvisor.me' };
		const payload: ResetPasswordDto = { password: 'newpassw0rd' };

		jwtService.decode = jest.fn().mockResolvedValue(jwtPayload);
		usersService.getByEmail = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(resetPasswordService.reset(token, payload)).rejects.toThrowError(UserNotFoundException);
	});
});
