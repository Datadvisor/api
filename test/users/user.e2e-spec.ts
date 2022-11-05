import { faker } from '@faker-js/faker/locale/en';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CookieMap } from 'set-cookie-parser';
import * as setCookie from 'set-cookie-parser';
import * as request from 'supertest';

import { AuthModule } from '../../src/auth/auth.module';
import { SigninDto } from '../../src/auth/dto/signin.dto';
import { ConfigModule } from '../../src/config/config.module';
import { PostgresModule } from '../../src/postgres/postgres.module';
import { PostgresService } from '../../src/postgres/postgres.service';
import { SeederModule } from '../../src/seeder/seeder.module';
import { SeederService } from '../../src/seeder/seeder.service';
import { SessionModule } from '../../src/session/session.module';
import { UpdateUserDto } from '../../src/users/dto/update-user.dto';
import { UpdateUserPreferencesDto } from '../../src/users/dto/update-user-preferences.dto';
import { Role, User } from '../../src/users/entities/user.entity';
import { UsersModule } from '../../src/users/users.module';

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

	it("should return the current user's preferences", async () => {
		const authCookie = `${userAuthCookies.at(0).API_SID.name}=${userAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer()).get('/user/preferences').set('Cookie', authCookie);

		expect(response.status).toEqual(HttpStatus.OK);
	});

	it("should not return the current user's preferences when the user is not signed-in", async () => {
		const response = await request(app.getHttpServer()).get(`/users/${users.at(0).id}/preferences`);

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

	it("should not update the current user's newsletter preference by id when the user is not signed-in", async () => {
		const payload: UpdateUserPreferencesDto = {
			newsletter: true,
		};
		const response = await request(app.getHttpServer())
			.patch(`/users/${users.at(0).id}/preferences`)
			.send(payload);

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
