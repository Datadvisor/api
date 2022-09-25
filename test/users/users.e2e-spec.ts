import { HttpStatus, INestApplication } from '@nestjs/common';
import { CookieMap } from 'set-cookie-parser';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import * as cuid from 'cuid';
import { faker } from '@faker-js/faker/locale/en';
import * as setCookie from 'set-cookie-parser';

import { PostgresModule, PostgresService } from '../../src/postgres';
import { SeederModule, SeederService } from '../../src/seeder';
import { Role, User } from '../../src/users/entities';
import { AuthModule } from '../../src/auth';
import { ConfigModule } from '../../src/config';
import { SessionModule } from '../../src/session';
import { UsersModule } from '../../src/users';
import { SigninDto } from '../../src/auth/dto';
import { UpdateUserDto } from '../../src/users/dto';

describe('Users', () => {
	let app: INestApplication;
	let postgresService: PostgresService;
	let seederService: SeederService;

	const adminAuthCookies: CookieMap[] = [];
	const userAuthCookies: CookieMap[] = [];
	let adminUsers: User[];
	let users: User[];

	beforeAll(async () => {
		const moduleFixture = await Test.createTestingModule({
			imports: [AuthModule, ConfigModule, PostgresModule, SeederModule, SessionModule, UsersModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		postgresService = moduleFixture.get<PostgresService>(PostgresService);
		seederService = moduleFixture.get<SeederService>(SeederService);

		await app.init();
	});

	beforeAll(async () => {
		adminUsers = await seederService.createUsers(1, Role.ADMIN);
		users = await seederService.createUsers(2, Role.USER);
	});

	beforeAll(async () => {
		for (let i = 0; i < adminUsers.length; i++) {
			const payload: SigninDto = {
				email: adminUsers.at(i).email,
				password: adminUsers.at(i).password,
			};
			const response = await request(app.getHttpServer()).post('/auth/signin').send(payload);
			const cookies = setCookie.parse(response.headers['set-cookie'], { map: true });

			adminAuthCookies.push(cookies);
		}
		for (let i = 0; i < users.length; i++) {
			const payload: SigninDto = {
				email: users.at(i).email,
				password: users.at(i).password,
			};
			const response = await request(app.getHttpServer()).post('/auth/signin').send(payload);

			const cookies = setCookie.parse(response.headers['set-cookie'], { map: true });
			userAuthCookies.push(cookies);
		}
	});

	afterAll(async () => {
		await postgresService.reset();
		await app.close();
	});

	it('should return a list of users', async () => {
		const authCookie = `${adminAuthCookies.at(0).API_SID.name}=${adminAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer()).get('/users').set('Cookie', authCookie);

		expect(response.status).toEqual(HttpStatus.OK);
	});

	it('should not return a list of users when the user is not signed-in', async () => {
		const response = await request(app.getHttpServer()).get('/users');

		expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
	});

	it('should not return a user list when the user does not have the necessary role', async () => {
		const authCookie = `${userAuthCookies.at(0).API_SID.name}=${userAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer()).get('/users').set('Cookie', authCookie);

		expect(response.status).toEqual(HttpStatus.FORBIDDEN);
	});

	it('should return the current user by id', async () => {
		const authCookie = `${userAuthCookies.at(0).API_SID.name}=${userAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer())
			.get(`/users/${users.at(0).id}`)
			.set('Cookie', authCookie);

		expect(response.status).toEqual(HttpStatus.OK);
	});

	it('should return a user by id', async () => {
		const authCookie = `${adminAuthCookies.at(0).API_SID.name}=${adminAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer())
			.get(`/users/${users.at(0).id}`)
			.set('Cookie', authCookie);

		expect(response.status).toEqual(HttpStatus.OK);
	});

	it('should not return an unknown user by id', async () => {
		const id = cuid();
		const authCookie = `${adminAuthCookies.at(0).API_SID.name}=${adminAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer()).get(`/users/${id}`).set('Cookie', authCookie);

		expect(response.status).toEqual(HttpStatus.NOT_FOUND);
	});

	it('should not return a user by id when the user is not signed-in', async () => {
		const response = await request(app.getHttpServer()).get(`/users/${users.at(0).id}`);

		expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
	});

	it('should not return a user by id when the user does not have the necessary role', async () => {
		const authCookie = `${userAuthCookies.at(0).API_SID.name}=${userAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer())
			.get(`/users/${adminUsers.at(0).id}`)
			.set('Cookie', authCookie);

		expect(response.status).toEqual(HttpStatus.FORBIDDEN);
	});

	it('should update the current user by id', async () => {
		const payload: UpdateUserDto = {
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
			password: faker.internet.password(8),
		};
		const authCookie = `${userAuthCookies.at(0).API_SID.name}=${userAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer())
			.patch(`/users/${users.at(0).id}`)
			.set('Cookie', authCookie)
			.send(payload);
		users[0] = response.body;

		expect(response.status).toEqual(HttpStatus.OK);
	});

	it('should update a user by id', async () => {
		const payload: UpdateUserDto = {
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
			password: faker.internet.password(8),
		};
		const authCookie = `${adminAuthCookies.at(0).API_SID.name}=${adminAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer())
			.patch(`/users/${users.at(0).id}`)
			.set('Cookie', authCookie)
			.send(payload);
		users[0] = response.body;

		expect(response.status).toEqual(HttpStatus.OK);
	});

	it('should not update an unknown user by id', async () => {
		const id = cuid();
		const payload: UpdateUserDto = {
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
			password: faker.internet.password(8),
		};
		const authCookie = `${adminAuthCookies.at(0).API_SID.name}=${adminAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer())
			.patch(`/users/${id}`)
			.set('Cookie', authCookie)
			.send(payload);

		expect(response.status).toEqual(HttpStatus.NOT_FOUND);
	});

	it('should not update a user with an existing email address', async () => {
		const payload: UpdateUserDto = {
			email: users.at(0).email,
		};
		const authCookie = `${userAuthCookies.at(0).API_SID.name}=${userAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer())
			.patch(`/users/${users.at(0).id}`)
			.set('Cookie', authCookie)
			.send(payload);

		expect(response.status).toEqual(HttpStatus.CONFLICT);
	});

	it('should not update a user by id when the user is not signed-in', async () => {
		const payload: UpdateUserDto = {
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
			password: faker.internet.password(8),
		};
		const response = await request(app.getHttpServer())
			.patch(`/users/${users.at(0).id}`)
			.send(payload);

		expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
	});

	it('should not update a user by id when the user does not have the necessary role', async () => {
		const payload: UpdateUserDto = {
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
			password: faker.internet.password(8),
		};
		const authCookie = `${userAuthCookies.at(0).API_SID.name}=${userAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer())
			.patch(`/users/${adminUsers.at(0).id}`)
			.set('Cookie', authCookie)
			.send(payload);

		expect(response.status).toEqual(HttpStatus.FORBIDDEN);
	});

	it('should not delete an unknown user by id', async () => {
		const id = cuid();
		const authCookie = `${adminAuthCookies.at(0).API_SID.name}=${adminAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer()).delete(`/users/${id}`).set('Cookie', authCookie);

		expect(response.status).toEqual(HttpStatus.NOT_FOUND);
	});

	it('should not delete a user by id when the user is not signed-in', async () => {
		const response = await request(app.getHttpServer()).delete(`/users/${users.at(0).id}`);

		expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
	});

	it('should not delete a user by id when the user does not have the necessary role', async () => {
		const authCookie = `${userAuthCookies.at(0).API_SID.name}=${userAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer())
			.delete(`/users/${adminUsers.at(0).id}`)
			.set('Cookie', authCookie);

		expect(response.status).toEqual(HttpStatus.FORBIDDEN);
	});

	it('should delete the current user by id', async () => {
		const authCookie = `${userAuthCookies.at(0).API_SID.name}=${userAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer())
			.delete(`/users/${users.at(0).id}`)
			.set('Cookie', authCookie);

		expect(response.status).toEqual(HttpStatus.NO_CONTENT);
	});

	it('should delete a user by id', async () => {
		const authCookie = `${adminAuthCookies.at(0).API_SID.name}=${adminAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer())
			.delete(`/users/${users.at(1).id}`)
			.set('Cookie', authCookie);

		expect(response.status).toEqual(HttpStatus.NO_CONTENT);
	});
});
