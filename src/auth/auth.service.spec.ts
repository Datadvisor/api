import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker/locale/en';
import * as cuid from 'cuid';

import { hash } from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users';
import { SigninDto, SignupDto } from './dto';
import { Role, User } from '../users/entities';
import { UnauthorizedAuthException } from './exceptions';
import { UserConflictException, UserNotFoundException } from '../users/exceptions';

describe('AuthService', () => {
	let authService: AuthService;
	let configService: ConfigService;
	let usersService: UsersService;

	let user: User;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
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

		authService = module.get<AuthService>(AuthService);
		configService = module.get<ConfigService>(ConfigService);
		usersService = module.get<UsersService>(UsersService);
	});

	beforeEach(() => {
		user = {
			id: cuid(),
			lastName: faker.name.lastName(),
			firstName: faker.name.firstName(),
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
			password: faker.internet.password(8),
			role: Role.USER,
			createdAt: faker.date.past(),
			updatedAt: faker.date.past(),
		};
	});

	it('should be defined', () => {
		expect(authService).toBeInstanceOf(AuthService);
		expect(authService).toBeDefined();
	});

	it('should signup a user without subscribe to the newsletter', async () => {
		const payload: SignupDto = {
			lastName: user.lastName,
			firstName: user.firstName,
			email: user.email,
			password: user.password,
			newsletter: false,
		};
		const expectedUser: User = {
			...user,
			password: await hash(user.password, configService.get<number>('api.saltRounds')),
		};

		usersService.create = jest.fn().mockResolvedValue(expectedUser);
		await expect(authService.signup(payload)).resolves.toMatchObject(expectedUser);
	});

	it('should signup a user and subscribe to the newsletter', async () => {
		const payload: SignupDto = {
			lastName: user.lastName,
			firstName: user.firstName,
			email: user.email,
			password: user.password,
			newsletter: true,
		};
		const expectedUser: User = {
			...user,
			password: await hash(user.password, configService.get<number>('api.saltRounds')),
		};

		usersService.create = jest.fn().mockResolvedValue(expectedUser);
		await expect(authService.signup(payload)).resolves.toMatchObject(expectedUser);
	});

	it('should not signup a user with an existing email address', async () => {
		const payload: SignupDto = {
			lastName: user.lastName,
			firstName: user.firstName,
			email: user.email,
			password: user.password,
			newsletter: false,
		};

		usersService.create = jest.fn().mockRejectedValue(new UserConflictException());
		await expect(authService.signup(payload)).rejects.toThrow(UserConflictException);
	});

	it('should sign-in a user', async () => {
		const payload: SigninDto = {
			email: user.email,
			password: user.password,
		};
		const expectedUser: User = {
			...user,
			password: await hash(user.password, configService.get<number>('api.saltRounds')),
		};

		usersService.getByEmail = jest.fn().mockResolvedValue(expectedUser);
		await expect(authService.signin(payload)).resolves.toMatchObject(expectedUser);
	});

	it('should not sign-in an unknown user', async () => {
		const payload: SigninDto = {
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
			password: user.password,
		};

		usersService.getByEmail = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(authService.signin(payload)).rejects.toThrow(UserNotFoundException);
	});

	it('should not sign-in a user with an invalid password', async () => {
		const payload: SigninDto = {
			email: user.email,
			password: faker.internet.password(8),
		};
		const expectedUser: User = {
			...user,
			password: await hash(user.password, configService.get<number>('api.saltRounds')),
		};

		usersService.getByEmail = jest.fn().mockResolvedValue(expectedUser);
		await expect(authService.signin(payload)).rejects.toThrow(UnauthorizedAuthException);
	});
});
