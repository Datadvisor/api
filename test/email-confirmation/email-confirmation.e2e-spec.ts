import { faker } from '@faker-js/faker/locale/en';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { CookieMap } from 'set-cookie-parser';
import * as setCookie from 'set-cookie-parser';
import * as request from 'supertest';

import { AuthModule } from '../../src/auth/auth.module';
import { SigninDto } from '../../src/auth/dto/signin.dto';
import { ConfigModule } from '../../src/config/config.module';
import { EmailConfirmationModule } from '../../src/email-confirmation/email-confirmation.module';
import { EmailConfirmationTokenPayloadType } from '../../src/email-confirmation/email-confirmation.type';
import { PostgresModule } from '../../src/postgres/postgres.module';
import { PostgresService } from '../../src/postgres/postgres.service';
import { SeederModule } from '../../src/seeder/seeder.module';
import { SeederService } from '../../src/seeder/seeder.service';
import { SessionModule } from '../../src/session/session.module';
import { Role, User } from '../../src/users/entities/user.entity';

describe('EmailConfirmation', () => {
	let app: INestApplication;
	let configService: ConfigService;
	let jwtService: JwtService;
	let postgresService: PostgresService;
	let seederService: SeederService;

	const userAuthCookies: CookieMap[] = [];
	let users: User[];

	beforeAll(async () => {
		const moduleFixture = await Test.createTestingModule({
			imports: [AuthModule, ConfigModule, EmailConfirmationModule, PostgresModule, SeederModule, SessionModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		configService = moduleFixture.get<ConfigService>(ConfigService);
		jwtService = moduleFixture.get<JwtService>(JwtService);
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

	it('should send a confirmation email to a user', async () => {
		const authCookie = `${userAuthCookies.at(0).API_SID.name}=${userAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer()).post('/email-confirmation').set('Cookie', authCookie);

		expect(response.status).toEqual(HttpStatus.NO_CONTENT);
	});

	it('should not send a confirmation email to a user when the user is not signed-in', async () => {
		const response = await request(app.getHttpServer()).post('/email-confirmation');

		expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
	});

	it('should confirm a user', async () => {
		const jwtPayload: EmailConfirmationTokenPayloadType = { email: users.at(0).email };
		const token = await jwtService.signAsync(jwtPayload, {
			secret: configService.get<string>('api.email-confirmation.jwtSecret'),
			expiresIn: configService.get<string>('api.email-confirmation.jwtExpirationTime'),
		});
		const response = await request(app.getHttpServer()).post(`/email-confirmation/confirm/${token}`);

		expect(response.status).toEqual(HttpStatus.NO_CONTENT);
	});

	it('should not send a confirmation email to an already confirmed user', async () => {
		const authCookie = `${userAuthCookies.at(0).API_SID.name}=${userAuthCookies.at(0).API_SID.value}`;
		const response = await request(app.getHttpServer()).post('/email-confirmation').set('Cookie', authCookie);

		expect(response.status).toEqual(HttpStatus.CONFLICT);
	});

	it('should not confirm an already confirmed user', async () => {
		const jwtPayload: EmailConfirmationTokenPayloadType = { email: users.at(0).email };
		const token = await jwtService.signAsync(jwtPayload, {
			secret: configService.get<string>('api.email-confirmation.jwtSecret'),
			expiresIn: configService.get<string>('api.email-confirmation.jwtExpirationTime'),
		});
		const response = await request(app.getHttpServer()).post(`/email-confirmation/confirm/${token}`);

		expect(response.status).toEqual(HttpStatus.GONE);
	});

	it('should not confirm a user with an invalid token', async () => {
		const jwtPayload: EmailConfirmationTokenPayloadType = { email: users.at(0).email };
		const token = await jwtService.signAsync(jwtPayload, {
			secret: configService.get<string>('api.email-confirmation.jwtSecret').slice(0, -1),
			expiresIn: configService.get<string>('api.email-confirmation.jwtExpirationTime'),
		});
		const response = await request(app.getHttpServer()).post(`/email-confirmation/confirm/${token}`);

		expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
	});

	it('should not confirm a user with an expired token', async () => {
		const jwtPayload: EmailConfirmationTokenPayloadType = { email: users.at(0).email };
		const token = await jwtService.signAsync(jwtPayload, {
			secret: configService.get<string>('api.email-confirmation.jwtSecret'),
			expiresIn: '0s',
		});
		const response = await request(app.getHttpServer()).post(`/email-confirmation/confirm/${token}`);

		expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
	});

	it('should not confirm an unknown user', async () => {
		const jwtPayload: EmailConfirmationTokenPayloadType = {
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
		};
		const token = await jwtService.signAsync(jwtPayload, {
			secret: configService.get<string>('api.email-confirmation.jwtSecret'),
			expiresIn: '0s',
		});
		const response = await request(app.getHttpServer()).post(`/email-confirmation/confirm/${token}`);

		expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
	});
});
