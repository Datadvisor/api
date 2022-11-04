import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { CookieMap } from 'set-cookie-parser';
import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker/locale/en';
import * as cuid from 'cuid';
import * as request from 'supertest';

import * as setCookie from 'set-cookie-parser';
import { User, Role } from '../../src/users/entities';
import { AuthModule } from '../../src/auth';
import { PostgresModule, PostgresService } from '../../src/postgres';
import { ConfigModule } from '../../src/config';
import { SessionModule } from '../../src/session';
import { SigninDto, SignupDto } from '../../src/auth/dto';

describe('Auth', () => {
	let app: INestApplication;
	let postgresService: PostgresService;

	const userAuthCookies: CookieMap[] = [];
	const users: User[] = [];

	beforeAll(async () => {
		const moduleFixture = await Test.createTestingModule({
			imports: [AuthModule, ConfigModule, PostgresModule, SessionModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		postgresService = moduleFixture.get<PostgresService>(PostgresService);

		app.useGlobalPipes(new ValidationPipe({ transform: true }));

		await app.init();
	});

	beforeAll(() => {
		const user: User = {
			id: cuid(),
			lastName: faker.name.lastName(),
			firstName: faker.name.firstName(),
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
			password: faker.internet.password(8),
			role: Role.USER,
			createdAt: faker.date.past(),
			updatedAt: faker.date.past(),
		};

		users.push(user);
	});

	afterAll(async () => {
		await postgresService.reset();
		await app.close();
	});

	it('should signup a user without subscribe to the newsletter', async () => {
		const payload: SignupDto = {
			lastName: users.at(0).lastName,
			firstName: users.at(0).firstName,
			email: users.at(0).email,
			password: users.at(0).password,
			newsletter: false,
		};
		const response = await request(app.getHttpServer()).post('/auth/signup').send(payload);

		expect(response.status).toEqual(HttpStatus.CREATED);
	});

	it('should not signup a user with an existing email', async () => {
		const payload: SignupDto = {
			lastName: users.at(0).lastName,
			firstName: users.at(0).firstName,
			email: users.at(0).email,
			password: users.at(0).password,
			newsletter: false,
		};
		const response = await request(app.getHttpServer()).post('/auth/signup').send(payload);

		expect(response.status).toEqual(HttpStatus.CONFLICT);
	});

	it('should not signup a user when the payload is invalid', async () => {
		const payload = {
			lastName: users.at(0).lastName,
			firstName: users.at(0).firstName,
			email: users.at(0).email,
		};
		const response = await request(app.getHttpServer()).post('/auth/signup').send(payload);

		expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
	});

	it('should sign-in a user', async () => {
		const payload: SigninDto = {
			email: users.at(0).email,
			password: users.at(0).password,
		};
		const response = await request(app.getHttpServer()).post('/auth/signin').send(payload);
		const cookies = setCookie.parse(response.headers['set-cookie'], { map: true });
		userAuthCookies.push(cookies);

		expect(cookies.API_SID).toBeDefined();
		expect(response.status).toEqual(HttpStatus.OK);
	});

	it('should not sign-in an unknown user', async () => {
		const payload: SigninDto = {
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
			password: users.at(0).password,
		};
		const response = await request(app.getHttpServer()).post('/auth/signin').send(payload);

		expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
	});

	it('should not sign-in a user with an invalid password', async () => {
		const payload: SigninDto = {
			email: users.at(0).email,
			password: faker.internet.password(8),
		};
		const response = await request(app.getHttpServer()).post('/auth/signin').send(payload);

		expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
	});

	it('should not sign-in a user when the payload is invalid', async () => {
		const payload = {
			email: users.at(0).email,
		};
		const response = await request(app.getHttpServer()).post('/auth/signin').send(payload);

		expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
	});

	it('should sign-out a user', async () => {
		const authCookie = `${userAuthCookies.at(0).API_SID.name}=${userAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer()).post('/auth/signout').set('Cookie', authCookie);

		expect(response.status).toEqual(HttpStatus.NO_CONTENT);
	});

	it('should not sign-out a user when when the user is not signed-in', async () => {
		const response = await request(app.getHttpServer()).post('/auth/signout');

		expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
	});
});
