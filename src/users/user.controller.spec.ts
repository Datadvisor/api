import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { ConflictException } from '@nestjs/common';

import { UserController } from './user.controller';
import { UsersService } from './users.service';
import { User } from './entities';
import { UserRo } from './ro';
import { UpdateUserDto } from './dto';
import { UserConflictException } from './exceptions';

describe('UserController', () => {
	let userController: UserController;
	let usersService: UsersService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [UsersService],
		})
			.useMocker(createMock)
			.compile();

		userController = module.get<UserController>(UserController);
		usersService = module.get<UsersService>(UsersService);
	});

	it('should be defined', () => {
		expect(userController).toBeInstanceOf(UserController);
		expect(userController).toBeDefined();
	});

	it('should return the current user', async () => {
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
		await expect(userController.get(user)).resolves.toMatchObject(new UserRo(user));
	});

	it('should update the current user', async () => {
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
		await expect(userController.update(user, payload)).resolves.toMatchObject(new UserRo(updatedUser));
	});

	it('should not update the current user with an existing email address', async () => {
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

		usersService.update = jest.fn().mockRejectedValue(new UserConflictException());
		await expect(userController.update(user, payload)).rejects.toThrowError(ConflictException);
	});

	it('should not update the current user when an error occurs', async () => {
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

		usersService.update = jest.fn().mockRejectedValue(new Error());
		await expect(userController.update(user, payload)).rejects.toThrowError(Error);
	});

	it('should delete the current user', async () => {
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
		await expect(userController.delete(user)).resolves.toBe(undefined);
	});
});
