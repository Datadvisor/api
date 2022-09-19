import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities';
import { UserRo } from './ro';
import { UserConflictException, UserNotFoundException } from './exceptions';
import { UpdateUserDto } from './dto';

describe('UsersController', () => {
	let usersController: UsersController;
	let usersService: UsersService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [UsersService],
		})
			.useMocker(createMock)
			.compile();

		usersController = module.get<UsersController>(UsersController);
		usersService = module.get<UsersService>(UsersService);
	});

	it('should be defined', () => {
		expect(usersController).toBeInstanceOf(UsersController);
		expect(usersController).toBeDefined();
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

		usersService.getAll = jest.fn().mockResolvedValue(users);
		await expect(usersController.getAll()).resolves.toMatchObject(users.map((user) => new UserRo(user)));
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

		usersService.getById = jest.fn().mockResolvedValue(user);
		await expect(usersController.getById('cl86azi1n0004mryy0j7p0mrv')).resolves.toMatchObject(new UserRo(user));
	});

	it('should not return an unknown user by id', async () => {
		usersService.getById = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(usersController.getById('cl86azi1n0004mryy0j7p0mrv')).rejects.toThrowError(NotFoundException);
	});

	it('should not return a user when an error occurs', async () => {
		usersService.getById = jest.fn().mockRejectedValue(new Error());
		await expect(usersController.getById('cl86azi1n0004mryy0j7p0mrv')).rejects.toThrowError(Error);
	});

	it('should update a user', async () => {
		const payload: UpdateUserDto = {
			email: 'john.doe@datadvisor.me',
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

		usersService.getById = jest.fn().mockResolvedValue(user);
		usersService.update = jest.fn().mockResolvedValue(updatedUser);
		await expect(usersController.update('cl86azi1n0004mryy0j7p0mrv', payload)).resolves.toMatchObject(
			new UserRo(updatedUser),
		);
	});

	it('should not update an unknown user', async () => {
		const payload: UpdateUserDto = {
			password: 'newpassw0rd',
		};

		usersService.update = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(usersController.update('cl86azi1n0004mryy0j7p0mrv', payload)).rejects.toThrowError(
			NotFoundException,
		);
	});

	it('should not update a user with an existing email address', async () => {
		const payload: UpdateUserDto = {
			email: 'john@datadvisor.me',
		};

		usersService.update = jest.fn().mockRejectedValue(new UserConflictException());
		await expect(usersController.update('cl86azi1n0004mryy0j7p0mrv', payload)).rejects.toThrowError(
			ConflictException,
		);
	});

	it('should not update a user when an error occurs', async () => {
		const payload: UpdateUserDto = {
			email: 'john@datadvisor.me',
		};

		usersService.update = jest.fn().mockRejectedValue(new Error());
		await expect(usersController.update('cl86azi1n0004mryy0j7p0mrv', payload)).rejects.toThrowError(Error);
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

		usersService.getById = jest.fn().mockResolvedValue(user);
		usersService.delete = jest.fn().mockResolvedValue({});
		await expect(usersController.delete('cl86azi1n0004mryy0j7p0mrv')).resolves.toBe(undefined);
	});

	it('should not delete an unknown user', async () => {
		usersService.delete = jest.fn().mockRejectedValue(new UserNotFoundException());
		await expect(usersController.delete('cl86azi1n0004mryy0j7p0mrv')).rejects.toThrowError(NotFoundException);
	});

	it('should not delete a user when an error occurs', async () => {
		usersService.delete = jest.fn().mockRejectedValue(new Error());
		await expect(usersController.delete('cl86azi1n0004mryy0j7p0mrv')).rejects.toThrowError(Error);
	});
});
