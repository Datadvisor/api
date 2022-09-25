import { HttpStatus, INestApplication } from '@nestjs/common';
import { CookieMap } from 'set-cookie-parser';
import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker/locale/en';
import * as request from 'supertest';
import * as setCookie from 'set-cookie-parser';

import { PostgresModule, PostgresService } from '../../src/postgres';
import { SeederModule, SeederService } from '../../src/seeder';
import { AuthModule } from '../../src/auth';
import { ConfigModule } from '../../src/config';
import { SessionModule } from '../../src/session';
import { UsersModule } from '../../src/users';
import { SigninDto } from '../../src/auth/dto';
import { UpdateUserDto } from '../../src/users/dto';
import { Role, User } from '../../src/users/entities';

describe('User', () => {
	let app: INestApplication;
	let postgresService: PostgresService;
	let seederService: SeederService;

	const userAuthCookies: CookieMap[] = [];
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
		users = await seederService.createUsers(1, Role.USER);
	});

	beforeAll(async () => {
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

	it('should return the current user', async () => {
		const authCookie = `${userAuthCookies.at(0).API_SID.name}=${userAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer()).get('/user').set('Cookie', authCookie);

		expect(response.status).toEqual(HttpStatus.OK);
	});

	it('should not return the current user when the user is not signed-in', async () => {
		const response = await request(app.getHttpServer()).get('/user');

		expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
	});

	it('should update the current user', async () => {
		const payload: UpdateUserDto = {
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
			password: faker.internet.password(8),
		};
		const authCookie = `${userAuthCookies.at(0).API_SID.name}=${userAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer()).patch('/user').set('Cookie', authCookie).send(payload);
		users[0] = response.body;

		expect(response.status).toEqual(HttpStatus.OK);
	});

	it('should not update the current user with an existing email address', async () => {
		const payload: UpdateUserDto = {
			email: users[0].email,
		};
		const authCookie = `${userAuthCookies.at(0).API_SID.name}=${userAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer()).patch('/user').set('Cookie', authCookie).send(payload);

		expect(response.status).toEqual(HttpStatus.CONFLICT);
	});

	it('should not update the current user when the user is not signed-in', async () => {
		const payload: UpdateUserDto = {
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
			password: faker.internet.password(8),
		};
		const response = await request(app.getHttpServer()).patch('/user').send(payload);

		expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
	});

	it('should delete the current user', async () => {
		const authCookie = `${userAuthCookies.at(0).API_SID.name}=${userAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer()).delete('/user').set('Cookie', authCookie);

		expect(response.status).toEqual(HttpStatus.NO_CONTENT);
	});

	it('should not delete the current user when the user is not signed-in', async () => {
		const response = await request(app.getHttpServer()).delete('/user');

		expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
	});
});
