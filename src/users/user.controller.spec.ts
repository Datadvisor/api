import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import * as cuid from 'cuid';
import { faker } from '@faker-js/faker/locale/en';
import { hash } from 'bcrypt';
import { ConflictException } from '@nestjs/common';

import { UserController } from './user.controller';
import { UsersService } from './users.service';
import { Role, User } from './entities';
import { UserRo } from './ro';
import { UpdateUserDto } from './dto';
import { UserConflictException } from './exceptions';

describe('UserController', () => {
	let userController: UserController;
	let usersService: UsersService;
	let configService: ConfigService;

	let user: User;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [
				UsersService,
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

		userController = module.get<UserController>(UserController);
		usersService = module.get<UsersService>(UsersService);
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
		expect(userController).toBeInstanceOf(UserController);
		expect(userController).toBeDefined();
	});

	it('should return the current user', async () => {
		usersService.getById = jest.fn().mockResolvedValue(user);
		await expect(userController.get(user)).resolves.toMatchObject(new UserRo(user));
	});

	it('should update the current user', async () => {
		const payload: UpdateUserDto = {
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
			password: faker.internet.password(8),
		};
		const expectedUser: User = {
			...user,
			email: payload.email,
			password: await hash(payload.password, configService.get<number>('api.saltRounds')),
		};

		usersService.getById = jest.fn().mockResolvedValue(user);
		usersService.update = jest.fn().mockResolvedValue(expectedUser);
		await expect(userController.update(user, payload)).resolves.toMatchObject(new UserRo(expectedUser));
	});

	it('should not update the current user with an existing email address', async () => {
		const payload: UpdateUserDto = {
			email: user.email,
		};

		usersService.update = jest.fn().mockRejectedValue(new UserConflictException());
		await expect(userController.update(user, payload)).rejects.toThrowError(ConflictException);
	});

	it('should not update the current user when an error occurs', async () => {
		const payload: UpdateUserDto = {
			email: user.email,
		};

		usersService.update = jest.fn().mockRejectedValue(new Error());
		await expect(userController.update(user, payload)).rejects.toThrowError(Error);
	});

	it('should delete the current user', async () => {
		usersService.getById = jest.fn().mockResolvedValue(user);
		usersService.delete = jest.fn().mockResolvedValue({});
		await expect(userController.delete(user)).resolves.toBe(undefined);
	});
});
