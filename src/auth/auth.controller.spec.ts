import { faker } from '@faker-js/faker/locale/en';
import { createMock } from '@golevelup/ts-jest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from 'bcrypt';
import * as cuid from 'cuid';

import { ISession } from '../session/session.type';
import { Role, User } from '../users/entities/user.entity';
import { UserConflictException } from '../users/exceptions/user-conflict.exception';
import { UserNotFoundException } from '../users/exceptions/user-not-found.exception';
import { UserRo } from '../users/ro/user.ro';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { UnauthorizedAuthException } from './exceptions/unauthorized-auth.exception';

describe('AuthController', () => {
	let authController: AuthController;
	let authService: AuthService;
	let configService: ConfigService;

	let user: User;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
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

		authController = module.get<AuthController>(AuthController);
		authService = module.get<AuthService>(AuthService);
		configService = module.get<ConfigService>(ConfigService);
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
		expect(authController).toBeInstanceOf(AuthController);
		expect(authController).toBeDefined();
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

		authService.signup = jest.fn().mockResolvedValue(expectedUser);
		await expect(authService.signup(payload)).resolves.toMatchObject(new UserRo(expectedUser));
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

		authService.signup = jest.fn().mockResolvedValue(expectedUser);
		await expect(authService.signup(payload)).resolves.toMatchObject(new UserRo(expectedUser));
	});

	it('should not signup a user with an existing email', async () => {
		const payload: SignupDto = {
			lastName: user.lastName,
			firstName: user.firstName,
			email: user.email,
			password: user.password,
			newsletter: false,
		};

		authService.signup = jest.fn().mockRejectedValue(new UserConflictException());
		await expect(authController.signup(payload)).rejects.toThrow(ConflictException);
	});

	it('should not signup a user when an error occurs', async () => {
		const payload: SignupDto = {
			lastName: user.lastName,
			firstName: user.firstName,
			email: user.email,
			password: user.password,
			newsletter: false,
		};

		authService.signup = jest.fn().mockRejectedValue(new Error());
		await expect(authController.signup(payload)).rejects.toThrow(Error);
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
		const session = {
			user: {},
			save: jest.fn(),
		} as unknown as ISession;

		authService.signin = jest.fn().mockResolvedValue(expectedUser);
		await expect(authController.signin(payload, session)).resolves.toMatchObject(new UserRo(expectedUser));
	});

	it('should not sign-in an unknown user', async () => {
		const payload: SigninDto = {
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
			password: user.password,
		};
		const session = {
			user: {},
			save: jest.fn(),
		} as unknown as ISession;

		authService.signin = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(authController.signin(payload, session)).rejects.toThrow(UnauthorizedException);
	});

	it('should not sign-in a user with an invalid password', async () => {
		const payload: SigninDto = {
			email: user.email,
			password: faker.internet.password(8),
		};
		const session = {
			user: {},
			save: jest.fn(),
		} as unknown as ISession;

		authService.signin = jest.fn().mockRejectedValue(new UnauthorizedAuthException());
		await expect(authController.signin(payload, session)).rejects.toThrow(UnauthorizedException);
	});

	it('should not sign-in when an error occurs', async () => {
		const payload: SigninDto = {
			email: user.email,
			password: user.password,
		};
		const session = {
			user: {},
			save: jest.fn(),
		} as unknown as ISession;

		authService.signin = jest.fn().mockRejectedValue(new Error());
		await expect(authController.signin(payload, session)).rejects.toThrow(Error);
	});
});
