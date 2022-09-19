import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { createMock } from '@golevelup/ts-jest';

import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { PostgresService } from '../postgres';
import { Role, User } from '../users/entities';
import { UserConflictException, UserNotFoundException } from './exceptions';

describe('UsersService', () => {
	let usersService: UsersService;
	let postgresService: PostgresService;

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
		postgresService = module.get<PostgresService>(PostgresService);
	});

	it('should be defined', () => {
		expect(usersService).toBeInstanceOf(UsersService);
		expect(usersService).toBeDefined();
	});

	it('should create a user', async () => {
		const payload: CreateUserDto = {
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
			role: 'UNCONFIRMED_USER',
			createdAt: new Date('2022-09-17T19:29:14.267Z'),
			updatedAt: new Date('2022-09-17T19:29:14.268Z'),
		};

		postgresService.user.findUnique = jest.fn().mockResolvedValue(null);
		postgresService.user.create = jest.fn().mockResolvedValue(user);
		await expect(usersService.create(payload)).resolves.toMatchObject(user);
	});

	it('should not create a user with an existing email address', async () => {
		const payload: CreateUserDto = {
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

		postgresService.user.findUnique = jest.fn().mockResolvedValue(user);
		await expect(usersService.create(payload)).rejects.toThrowError(UserConflictException);
	});

	it('should return a list of users', async () => {
		const users: User[] = [
			{
				id: 'cl86azi1n0004mryy0j7p0mrv',
				lastName: 'Doe',
				firstName: 'John',
				email: 'john@datadvisor.me',
				password: '$2a$10$eQiKBbTlFwuZntlB7ioGUelCLGn.Mn13OJ4HXVWiGR8YuIyLBpNnK',
				role: 'USER',
				createdAt: new Date('2022-09-17T19:29:14.267Z'),
				updatedAt: new Date('2022-09-17T19:29:14.268Z'),
			},
			{
				id: 'cl87f7oam00003b603utiix4b',
				lastName: 'Doe',
				firstName: 'Jane',
				email: 'jane@datadvisor.me',
				password: '$2a$10$eQiKBbTlFwuZntlB7ioGUelCLGn.Mn13OJ4HXVWiGR8YuIyLBpNnK',
				role: 'USER',
				createdAt: new Date('2022-09-17T19:29:14.267Z'),
				updatedAt: new Date('2022-09-17T19:29:14.268Z'),
			},
		];

		postgresService.user.findMany = jest.fn().mockResolvedValue(users);
		await expect(usersService.getAll()).resolves.toMatchObject(users);
	});

	it('should return a user by id', async () => {
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

		postgresService.user.findUnique = jest.fn().mockResolvedValue(user);
		await expect(usersService.getById('cl86azi1n0004mryy0j7p0mrv')).resolves.toMatchObject(user);
	});

	it('should not return an unknown user by id', async () => {
		postgresService.user.findUnique = jest.fn().mockResolvedValue(null);
		await expect(usersService.getById('cl86azi1n0004mryy0j7p0mrv')).rejects.toThrowError(UserNotFoundException);
	});

	it('should return a user by email', async () => {
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

		postgresService.user.findUnique = jest.fn().mockResolvedValue(user);
		await expect(usersService.getByEmail('john@datadvisor.me')).resolves.toMatchObject(user);
	});

	it('should not return an unknown user by email', async () => {
		postgresService.user.findUnique = jest.fn().mockResolvedValue(null);
		await expect(usersService.getByEmail('janeth@datadvisor.me')).rejects.toThrowError(UserNotFoundException);
	});

	it("should update a user's email", async () => {
		const payload: UpdateUserDto = {
			email: 'john.doe@datadvisor.me',
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
		const updatedUser: User = {
			id: 'cl86azi1n0004mryy0j7p0mrv',
			lastName: 'Doe',
			firstName: 'John',
			email: 'john.doe@datadvisor.me',
			password: '$2a$10$RnAqBFP2yfe.fUjqtAQnFu6Mh5iw6gtSNjWYVsHDQ8gjf5hnuw.Cq',
			role: 'USER',
			createdAt: new Date('2022-09-17T19:29:14.267Z'),
			updatedAt: new Date('2022-09-17T19:29:14.268Z'),
		};

		postgresService.user.findUnique = jest.fn().mockResolvedValueOnce(user).mockReturnValueOnce(null);
		postgresService.user.update = jest.fn().mockResolvedValue(updatedUser);
		await expect(usersService.update('cl86azi1n0004mryy0j7p0mrv', payload)).resolves.toMatchObject(updatedUser);
	});

	it("should update a user's password", async () => {
		const payload: UpdateUserDto = {
			password: 'newpassw0rd',
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
		const updatedUser: User = {
			id: 'cl86azi1n0004mryy0j7p0mrv',
			lastName: 'Doe',
			firstName: 'John',
			email: 'john.doe@datadvisor.me',
			password: '$2a$10$RnAqBFP2yfe.fUjqtAQnFu6Mh5iw6gtSNjWYVsHDQ8gjf5hnuw.Cq',
			role: 'USER',
			createdAt: new Date('2022-09-17T19:29:14.267Z'),
			updatedAt: new Date('2022-09-17T19:29:14.268Z'),
		};

		postgresService.user.findUnique = jest.fn().mockResolvedValueOnce(user).mockReturnValueOnce(null);
		postgresService.user.update = jest.fn().mockResolvedValue(updatedUser);
		await expect(usersService.update('cl86azi1n0004mryy0j7p0mrv', payload)).resolves.toMatchObject(updatedUser);
	});

	it('should not update an unknown user', async () => {
		const payload: UpdateUserDto = {
			password: 'newpassw0rd',
		};

		postgresService.user.findUnique = jest.fn().mockResolvedValue(null);
		await expect(usersService.update('cl86azi1n0004mryy0j7p0mrv', payload)).rejects.toThrowError(
			UserNotFoundException,
		);
	});

	it('should not update a user with an existing email address', async () => {
		const payload: UpdateUserDto = {
			email: 'john@datadvisor.me',
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

		postgresService.user.findUnique = jest.fn().mockResolvedValue(user);
		await expect(usersService.update('cl86azi1n0004mryy0j7p0mrv', payload)).rejects.toThrowError(
			UserConflictException,
		);
	});

	it("should update a user's role", async () => {
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

		postgresService.user.findUnique = jest.fn().mockResolvedValue(user);
		postgresService.user.update = jest.fn().mockResolvedValue(updatedUser);
		await expect(usersService.updateRole('cl86azi1n0004mryy0j7p0mrv', Role.USER)).resolves.toMatchObject(
			updatedUser,
		);
	});

	it('should not update the role of an unknown user', async () => {
		postgresService.user.findUnique = jest.fn().mockResolvedValue(null);
		await expect(usersService.updateRole('cl86azi1n0004mryy0j7p0mrv', Role.USER)).rejects.toThrowError(
			UserNotFoundException,
		);
	});

	it('should delete a user', async () => {
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
		const deletedUser: User = {
			id: 'cl86azi1n0004mryy0j7p0mrv',
			lastName: 'Doe',
			firstName: 'John',
			email: 'john@datadvisor.me',
			password: '$2a$10$eQiKBbTlFwuZntlB7ioGUelCLGn.Mn13OJ4HXVWiGR8YuIyLBpNnK',
			role: 'USER',
			createdAt: new Date('2022-09-17T19:29:14.267Z'),
			updatedAt: new Date('2022-09-17T19:29:14.268Z'),
		};

		postgresService.user.findUnique = jest.fn().mockResolvedValue(user);
		postgresService.user.delete = jest.fn().mockResolvedValue(deletedUser);
		await expect(usersService.delete('cl86azi1n0004mryy0j7p0mrv')).resolves.toMatchObject(deletedUser);
	});

	it('should not delete an unknown user', async () => {
		postgresService.user.findUnique = jest.fn().mockResolvedValue(null);
		await expect(usersService.delete('cl86azi1n0004mryy0j7p0mrv')).rejects.toThrowError(UserNotFoundException);
	});
});
