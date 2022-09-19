import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

import { AuthService } from './auth.service';
import { UsersService } from '../users';
import { SigninDto, SignupDto } from './dto';
import { User } from '../users/entities';
import { UnauthorizedAuthException } from './exceptions';
import { UserConflictException, UserNotFoundException } from '../users/exceptions';
import { CreateUserDto } from '../users/dto';

describe('AuthService', () => {
	let authService: AuthService;
	let usersService: UsersService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [AuthService],
		})
			.useMocker(createMock)
			.compile();

		authService = module.get<AuthService>(AuthService);
		usersService = module.get<UsersService>(UsersService);
	});

	it('should be defined', () => {
		expect(authService).toBeInstanceOf(AuthService);
		expect(authService).toBeDefined();
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

		usersService.create = jest.fn().mockResolvedValue(user);
		await expect(authService.signup(payload)).resolves.toMatchObject(user);
	});

	it('should not signup a user with an existing email address', async () => {
		const payload: CreateUserDto = {
			lastName: 'Doe',
			firstName: 'John',
			email: 'john@datadvisor.me',
			password: 'passw0rd',
		};

		usersService.create = jest.fn().mockRejectedValue(new UserConflictException());
		await expect(authService.signup(payload)).rejects.toThrowError(UserConflictException);
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

		usersService.getByEmail = jest.fn().mockResolvedValue(user);
		await expect(authService.signin(payload)).resolves.toMatchObject(user);
	});

	it('should not sign-in an unknown user', async () => {
		const payload: SigninDto = {
			email: 'janeth@datadvisor.me',
			password: 'passw0rd',
		};

		usersService.getByEmail = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(authService.signin(payload)).rejects.toThrowError(UserNotFoundException);
	});

	it('should not sign-in a user with an invalid password', async () => {
		const payload: SigninDto = {
			email: 'john@datadvisor.me',
			password: 'b4dpassw0rd',
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

		usersService.getByEmail = jest.fn().mockResolvedValue(user);
		await expect(authService.signin(payload)).rejects.toThrowError(UnauthorizedAuthException);
	});
});
