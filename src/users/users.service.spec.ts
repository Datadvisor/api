import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as cuid from 'cuid';
import { faker } from '@faker-js/faker/locale/en';
import { createMock } from '@golevelup/ts-jest';

import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { PostgresService } from '../postgres';
import { Role, User } from '../users/entities';
import { UserConflictException, UserNotFoundException } from './exceptions';
import { hash } from 'bcrypt';

describe('UsersService', () => {
	let usersService: UsersService;
	let configService: ConfigService;
	let postgresService: PostgresService;

	let user: User;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
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

		usersService = module.get<UsersService>(UsersService);
		configService = module.get<ConfigService>(ConfigService);
		postgresService = module.get<PostgresService>(PostgresService);
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
		expect(usersService).toBeInstanceOf(UsersService);
		expect(usersService).toBeDefined();
	});

	it('should create a user', async () => {
		const payload: CreateUserDto = {
			lastName: user.lastName,
			firstName: user.firstName,
			email: user.email,
			password: user.password,
		};
		const expectedUser: User = {
			...user,
			password: await hash(user.password, configService.get<number>('api.saltRounds')),
		};

		postgresService.user.findUnique = jest.fn().mockResolvedValue(null);
		postgresService.user.create = jest.fn().mockResolvedValue(expectedUser);
		await expect(usersService.create(payload)).resolves.toMatchObject(expectedUser);
	});

	it('should not create a user with an existing email address', async () => {
		const payload: CreateUserDto = {
			lastName: user.lastName,
			firstName: user.firstName,
			email: user.email,
			password: user.password,
		};

		postgresService.user.findUnique = jest.fn().mockResolvedValue(user);
		await expect(usersService.create(payload)).rejects.toThrow(UserConflictException);
	});

	it('should return a list of users', async () => {
		const users: User[] = [
			{ ...user, password: await hash(user.password, configService.get<number>('api.saltRounds')) },
		];

		postgresService.user.findMany = jest.fn().mockResolvedValue(users);
		await expect(usersService.getAll()).resolves.toMatchObject(users);
	});

	it('should return a user by id', async () => {
		const expectedUser: User = {
			...user,
			password: await hash(user.password, configService.get<number>('api.saltRounds')),
		};

		postgresService.user.findUnique = jest.fn().mockResolvedValue(expectedUser);
		await expect(usersService.getById(user.id)).resolves.toMatchObject(expectedUser);
	});

	it('should not return an unknown user by id', async () => {
		const id = cuid();

		postgresService.user.findUnique = jest.fn().mockResolvedValue(null);
		await expect(usersService.getById(id)).rejects.toThrow(UserNotFoundException);
	});

	it('should return a user by email', async () => {
		const expectedUser: User = {
			...user,
			password: await hash(user.password, configService.get<number>('api.saltRounds')),
		};

		postgresService.user.findUnique = jest.fn().mockResolvedValue(expectedUser);
		await expect(usersService.getByEmail(user.email)).resolves.toMatchObject(expectedUser);
	});

	it('should not return an unknown user by email', async () => {
		const email = faker.internet.email(undefined, undefined, 'datadvisor.me');

		postgresService.user.findUnique = jest.fn().mockResolvedValue(null);
		await expect(usersService.getByEmail(email)).rejects.toThrow(UserNotFoundException);
	});

	it("should update a user's email", async () => {
		const payload: UpdateUserDto = {
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
		};
		const foundUser = { ...user, password: configService.get<number>('api.saltRounds') };
		const expectedUser: User = {
			...user,
			email: payload.email,
			password: await hash(user.password, configService.get<number>('api.saltRounds')),
		};

		postgresService.user.findUnique = jest.fn().mockResolvedValueOnce(foundUser).mockReturnValueOnce(null);
		postgresService.user.update = jest.fn().mockResolvedValue(expectedUser);
		await expect(usersService.update(user.id, payload)).resolves.toMatchObject(expectedUser);
	});

	it("should update a user's password", async () => {
		const payload: UpdateUserDto = {
			password: faker.internet.password(8),
		};
		const foundUser = { ...user, password: configService.get<number>('api.saltRounds') };
		const expectedUser: User = {
			...user,
			password: await hash(user.password, configService.get<number>('api.saltRounds')),
		};

		postgresService.user.findUnique = jest.fn().mockResolvedValueOnce(foundUser).mockReturnValueOnce(null);
		postgresService.user.update = jest.fn().mockResolvedValue(expectedUser);
		await expect(usersService.update(user.id, payload)).resolves.toMatchObject(expectedUser);
	});

	it('should not update an unknown user', async () => {
		const id = cuid();
		const payload: UpdateUserDto = {
			password: faker.internet.password(8),
		};

		postgresService.user.findUnique = jest.fn().mockResolvedValue(null);
		await expect(usersService.update(id, payload)).rejects.toThrow(UserNotFoundException);
	});

	it('should not update a user with an existing email address', async () => {
		const payload: UpdateUserDto = {
			email: user.email,
		};
		const foundUser = { ...user, password: configService.get<number>('api.saltRounds') };

		postgresService.user.findUnique = jest.fn().mockResolvedValue(foundUser);
		await expect(usersService.update(user.id, payload)).rejects.toThrow(UserConflictException);
	});

	it("should update a user's role", async () => {
		const expectedUser: User = {
			...user,
			password: await hash(user.password, configService.get<number>('api.saltRounds')),
			role: Role.USER,
		};
		const foundUser = { ...user, password: configService.get<number>('api.saltRounds') };

		postgresService.user.findUnique = jest.fn().mockResolvedValue(foundUser);
		postgresService.user.update = jest.fn().mockResolvedValue(expectedUser);
		await expect(usersService.updateRole(user.id, Role.USER)).resolves.toMatchObject(expectedUser);
	});

	it('should not update the role of an unknown user', async () => {
		const id = cuid();

		postgresService.user.findUnique = jest.fn().mockResolvedValue(null);
		await expect(usersService.updateRole(id, Role.USER)).rejects.toThrow(UserNotFoundException);
	});

	it('should delete a user', async () => {
		const expectedUser: User = {
			...user,
			password: await hash(user.password, configService.get<number>('api.saltRounds')),
		};

		postgresService.user.findUnique = jest.fn().mockResolvedValue(expectedUser);
		postgresService.user.delete = jest.fn().mockResolvedValue(expectedUser);
		await expect(usersService.delete(user.id)).resolves.toMatchObject(expectedUser);
	});

	it('should not delete an unknown user', async () => {
		const id = cuid();

		postgresService.user.findUnique = jest.fn().mockResolvedValue(null);
		await expect(usersService.delete(id)).rejects.toThrow(UserNotFoundException);
	});
});
