import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import * as cuid from 'cuid';
import { faker } from '@faker-js/faker/locale/en';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role, User } from './entities';
import { UserRo } from './ro';
import { UserConflictException, UserNotFoundException } from './exceptions';
import { UpdateUserDto } from './dto';
import { hash } from 'bcrypt';

describe('UsersController', () => {
	let usersController: UsersController;
	let usersService: UsersService;
	let configService: ConfigService;

	let user: User;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
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

		usersController = module.get<UsersController>(UsersController);
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
		expect(usersController).toBeInstanceOf(UsersController);
		expect(usersController).toBeDefined();
	});

	it('should return a list of users', async () => {
		const users: User[] = [user];

		usersService.getAll = jest.fn().mockResolvedValue(users);
		await expect(usersController.getAll()).resolves.toMatchObject(users.map((_user) => new UserRo(_user)));
	});

	it('should return a user by id', async () => {
		usersService.getById = jest.fn().mockResolvedValue(user);
		await expect(usersController.getById(user.id)).resolves.toMatchObject(new UserRo(user));
	});

	it('should not return an unknown user by id', async () => {
		const id = cuid();

		usersService.getById = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(usersController.getById(id)).rejects.toThrowError(NotFoundException);
	});

	it('should not return a user when an error occurs', async () => {
		usersService.getById = jest.fn().mockRejectedValue(new Error());
		await expect(usersController.getById(user.id)).rejects.toThrowError(Error);
	});

	it('should update a user', async () => {
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
		await expect(usersController.update(user.id, payload)).resolves.toMatchObject(new UserRo(expectedUser));
	});

	it('should not update an unknown user', async () => {
		const id = cuid();
		const payload: UpdateUserDto = {
			password: faker.internet.password(8),
		};

		usersService.update = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(usersController.update(id, payload)).rejects.toThrowError(NotFoundException);
	});

	it('should not update a user with an existing email address', async () => {
		const payload: UpdateUserDto = {
			email: user.email,
		};

		usersService.update = jest.fn().mockRejectedValue(new UserConflictException());
		await expect(usersController.update(user.id, payload)).rejects.toThrowError(ConflictException);
	});

	it('should not update a user when an error occurs', async () => {
		const payload: UpdateUserDto = {
			email: user.email,
		};

		usersService.update = jest.fn().mockRejectedValue(new Error());
		await expect(usersController.update(user.id, payload)).rejects.toThrowError(Error);
	});

	it('should delete a user', async () => {
		usersService.getById = jest.fn().mockResolvedValue(user);
		usersService.delete = jest.fn().mockResolvedValue({});
		await expect(usersController.delete(user.id)).resolves.toBe(undefined);
	});

	it('should not delete an unknown user', async () => {
		const id = cuid();

		usersService.delete = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(usersController.delete(id)).rejects.toThrowError(NotFoundException);
	});

	it('should not delete a user when an error occurs', async () => {
		const id = cuid();

		usersService.delete = jest.fn().mockRejectedValue(new Error());
		await expect(usersController.delete(id)).rejects.toThrowError(Error);
	});
});
