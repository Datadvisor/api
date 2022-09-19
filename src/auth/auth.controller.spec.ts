import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto } from './dto';
import { User } from '../users/entities';
import { UserRo } from '../users/ro';
import { CreateUserDto } from '../users/dto';
import { UserConflictException, UserNotFoundException } from '../users/exceptions';
import { ISession } from '../session';
import { UnauthorizedAuthException } from './exceptions';

describe('AuthController', () => {
	let authController: AuthController;
	let authService: AuthService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [AuthService],
		})
			.useMocker(createMock)
			.compile();

		authController = module.get<AuthController>(AuthController);
		authService = module.get<AuthService>(AuthService);
	});

	it('should be defined', () => {
		expect(authController).toBeInstanceOf(AuthController);
		expect(authController).toBeDefined();
	});

	it('should signup a user', async () => {
		const payload: SignupDto = {
			lastName: 'Doe',
			firstName: 'John',
			email: 'john@datadvisor.me',
			password: 'passw0rd',
		};
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

		authService.signup = jest.fn().mockResolvedValue(user);
		await expect(authService.signup(payload)).resolves.toMatchObject(new UserRo(user));
	});

	it('should not signup a user with an existing email', async () => {
		const payload: CreateUserDto = {
			lastName: 'Doe',
			firstName: 'John',
			email: 'john@datadvisor.me',
			password: 'passw0rd',
		};

		authService.signup = jest.fn().mockRejectedValue(new UserConflictException());
		await expect(authController.signup(payload)).rejects.toThrowError(ConflictException);
	});

	it('should not signup a user when an error occurs', async () => {
		const payload: CreateUserDto = {
			lastName: 'Doe',
			firstName: 'John',
			email: 'john@datadvisor.me',
			password: 'passw0rd',
		};

		authService.signup = jest.fn().mockRejectedValue(new Error());
		await expect(authController.signup(payload)).rejects.toThrowError(Error);
	});

	it('should sign-in a user', async () => {
		const payload: SigninDto = {
			email: 'john@datadvisor.me',
			password: 'passw0rd',
		};
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
		const session = {
			user: {},
			save: jest.fn(),
		} as unknown as ISession;

		authService.signin = jest.fn().mockResolvedValue(user);
		await expect(authController.signin(payload, session)).resolves.toMatchObject(user);
	});

	it('should not sign-in an unknown user', async () => {
		const payload: SigninDto = {
			email: 'janeth@datadvisor.me',
			password: 'passw0rd',
		};
		const session = {
			user: {},
			save: jest.fn(),
		} as unknown as ISession;

		authService.signin = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(authController.signin(payload, session)).rejects.toThrowError(UnauthorizedException);
	});

	it('should not sign-in a user with an invalid password', async () => {
		const payload: SigninDto = {
			email: 'john@datadvisor.me',
			password: 'b4dpassw0rd',
		};
		const session = {
			user: {},
			save: jest.fn(),
		} as unknown as ISession;

		authService.signin = jest.fn().mockRejectedValue(new UnauthorizedAuthException());
		await expect(authController.signin(payload, session)).rejects.toThrowError(UnauthorizedException);
	});

	it('should not sign-in when an error occurs', async () => {
		const payload: SigninDto = {
			email: 'janeth@datadvisor.me',
			password: 'passw0rd',
		};
		const session = {
			user: {},
			save: jest.fn(),
		} as unknown as ISession;

		authService.signin = jest.fn().mockRejectedValue(new Error());
		await expect(authController.signin(payload, session)).rejects.toThrowError(Error);
	});
});
