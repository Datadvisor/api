import { faker } from '@faker-js/faker/locale/en';
import { createMock } from '@golevelup/ts-jest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from 'bcrypt';
import * as cuid from 'cuid';

import { SubscriberConflictException } from '../newsletter/exceptions/subscriber-conflict.exception';
import { SubscriberNotFoundException } from '../newsletter/exceptions/subscriber-not-found.exception';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { Frequency, Preferences, Role, Scrapper, User } from './entities/user.entity';
import { UserConflictException } from './exceptions/user-conflict.exception';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { UserRo } from './ro/user.ro';
import { UserPreferencesRo } from './ro/user-preferences.ro';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

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
			emailVerified: true,
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
		await expect(usersController.getById(id)).rejects.toThrow(NotFoundException);
	});

	it('should not return a user when an error occurs', async () => {
		usersService.getById = jest.fn().mockRejectedValue(new Error());
		await expect(usersController.getById(user.id)).rejects.toThrow(Error);
	});

	it("should return the user's preferences by user id", async () => {
		const expectedPreferences: Preferences = {
			id: cuid(),
			newsletter: false,
			activitiesReport: false,
			activitiesReportFrequency: Frequency.MONTHLY,
			activitiesReportScrapper: Scrapper.NAME,
			userId: user.id,
		};

		usersService.getPreferences = jest.fn().mockResolvedValue(expectedPreferences);
		await expect(usersController.getPreferences(user.id)).resolves.toMatchObject(
			new UserPreferencesRo(expectedPreferences),
		);
	});

	it("should not return the user's preferences for an unknown user", async () => {
		usersService.getPreferences = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(usersController.getPreferences(user.id)).rejects.toThrow(NotFoundException);
	});

	it("should not return the user's preferences when an error occurs", async () => {
		usersService.getPreferences = jest.fn().mockRejectedValue(new Error());
		await expect(usersController.getPreferences(user.id)).rejects.toThrow(Error);
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

		usersService.update = jest.fn().mockResolvedValue(expectedUser);
		await expect(usersController.update(user.id, payload)).resolves.toMatchObject(new UserRo(expectedUser));
	});

	it('should not update an unknown user', async () => {
		const id = cuid();
		const payload: UpdateUserDto = {
			password: faker.internet.password(8),
		};

		usersService.update = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(usersController.update(id, payload)).rejects.toThrow(NotFoundException);
	});

	it('should not update a user with an existing email address', async () => {
		const payload: UpdateUserDto = {
			email: user.email,
		};

		usersService.update = jest.fn().mockRejectedValue(new UserConflictException());
		await expect(usersController.update(user.id, payload)).rejects.toThrow(ConflictException);
	});

	it('should not update a user when an error occurs', async () => {
		const payload: UpdateUserDto = {
			email: user.email,
		};

		usersService.update = jest.fn().mockRejectedValue(new Error());
		await expect(usersController.update(user.id, payload)).rejects.toThrow(Error);
	});

	it("should update a user's newsletter preference", async () => {
		const payload: UpdateUserPreferencesDto = {
			newsletter: true,
		};
		const expectedPreferences: Preferences = {
			id: cuid(),
			newsletter: true,
			activitiesReport: false,
			activitiesReportFrequency: Frequency.MONTHLY,
			activitiesReportScrapper: Scrapper.NAME,
			userId: user.id,
		};

		usersService.updatePreferences = jest.fn().mockResolvedValue(expectedPreferences);
		await expect(usersController.updatePreferences(user.id, payload)).resolves.toMatchObject(
			new UserPreferencesRo(expectedPreferences),
		);
	});

	it("should not update a user's newsletter preference for an unknown user", async () => {
		const payload: UpdateUserPreferencesDto = {
			newsletter: true,
		};

		usersService.updatePreferences = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(usersController.updatePreferences(user.id, payload)).rejects.toThrow(NotFoundException);
	});

	it("should not update a user's newsletter preference when the user is already subscribed", async () => {
		const payload: UpdateUserPreferencesDto = {
			newsletter: true,
		};

		usersService.updatePreferences = jest.fn().mockRejectedValue(new SubscriberNotFoundException());
		await expect(usersController.updatePreferences(user.id, payload)).rejects.toThrow(NotFoundException);
	});

	it("should not update a user's newsletter preference when the user is not subscribed", async () => {
		const payload: UpdateUserPreferencesDto = {
			newsletter: true,
		};

		usersService.updatePreferences = jest.fn().mockRejectedValue(new SubscriberConflictException());
		await expect(usersController.updatePreferences(user.id, payload)).rejects.toThrow(ConflictException);
	});

	it("should not update a user's newsletter preference when an error occurs", async () => {
		const payload: UpdateUserPreferencesDto = {
			newsletter: true,
		};

		usersService.updatePreferences = jest.fn().mockRejectedValue(new Error());
		await expect(usersController.updatePreferences(user.id, payload)).rejects.toThrow(Error);
	});

	it('should delete a user', async () => {
		usersService.getById = jest.fn().mockResolvedValue(user);
		usersService.delete = jest.fn().mockResolvedValue({});
		await expect(usersController.delete(user.id)).resolves.toBe(undefined);
	});

	it('should not delete an unknown user', async () => {
		const id = cuid();

		usersService.delete = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(usersController.delete(id)).rejects.toThrow(NotFoundException);
	});

	it('should not delete a user when an error occurs', async () => {
		const id = cuid();

		usersService.delete = jest.fn().mockRejectedValue(new Error());
		await expect(usersController.delete(id)).rejects.toThrow(Error);
	});
});
