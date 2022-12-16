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
import { UserRo } from './ro/user.ro';
import { UserPreferencesRo } from './ro/user-preferences.ro';
import { UserController } from './user.controller';
import { UsersService } from './users.service';

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
			emailVerified: true,
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

	it("should return the current user's preferences", async () => {
		const expectedPreferences: Preferences = {
			id: cuid(),
			newsletter: false,
			activitiesReport: false,
			activitiesReportFrequency: Frequency.MONTHLY,
			activitiesReportScrapper: Scrapper.NAME,
			userId: user.id,
		};

		usersService.getPreferences = jest.fn().mockResolvedValue(expectedPreferences);
		await expect(userController.getPreferences(user)).resolves.toMatchObject(
			new UserPreferencesRo(expectedPreferences),
		);
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

		usersService.update = jest.fn().mockResolvedValue(expectedUser);
		await expect(userController.update(user, payload)).resolves.toMatchObject(new UserRo(expectedUser));
	});

	it('should not update the current user with an existing email address', async () => {
		const payload: UpdateUserDto = {
			email: user.email,
		};

		usersService.update = jest.fn().mockRejectedValue(new UserConflictException());
		await expect(userController.update(user, payload)).rejects.toThrow(ConflictException);
	});

	it('should not update the current user when an error occurs', async () => {
		const payload: UpdateUserDto = {
			email: user.email,
		};

		usersService.update = jest.fn().mockRejectedValue(new Error());
		await expect(userController.update(user, payload)).rejects.toThrow(Error);
	});

	it("should update the current user's newsletter preference", async () => {
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
		await expect(userController.updatePreferences(user, payload)).resolves.toMatchObject(
			new UserPreferencesRo(expectedPreferences),
		);
	});

	it("should not update the current user's newsletter preference if the user is already subscribed", async () => {
		const payload: UpdateUserPreferencesDto = {
			newsletter: true,
		};

		usersService.updatePreferences = jest.fn().mockRejectedValue(new SubscriberNotFoundException());
		await expect(userController.updatePreferences(user, payload)).rejects.toThrow(NotFoundException);
	});

	it("should not update the current user's newsletter preference if the user is not subscribed", async () => {
		const payload: UpdateUserPreferencesDto = {
			newsletter: true,
		};

		usersService.updatePreferences = jest.fn().mockRejectedValue(new SubscriberConflictException());
		await expect(userController.updatePreferences(user, payload)).rejects.toThrow(ConflictException);
	});

	it("should not update the current user's newsletter preference when an error occurs", async () => {
		const payload: UpdateUserPreferencesDto = {
			newsletter: true,
		};

		usersService.updatePreferences = jest.fn().mockRejectedValue(new Error());
		await expect(userController.updatePreferences(user, payload)).rejects.toThrow(Error);
	});

	it('should delete the current user', async () => {
		usersService.getById = jest.fn().mockResolvedValue(user);
		usersService.delete = jest.fn().mockResolvedValue({});
		await expect(userController.delete(user)).resolves.toBe(undefined);
	});
});
