import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker/locale/en';
import * as request from 'supertest';

import { PostgresModule, PostgresService } from '../../src/postgres';
import { SeederModule, SeederService } from '../../src/seeder';
import { UsersService } from '../../src/users';
import { Role, User } from '../../src/users/entities';
import { AuthModule } from '../../src/auth';
import { ConfigModule } from '../../src/config';
import { ResetPasswordModule, ResetPasswordTokenPayloadType } from '../../src/reset-password';
import { SessionModule } from '../../src/session';
import { ResetPasswordDto, SendResetPasswordEmailDto } from '../../src/reset-password/dto';

describe('ResetPassword', () => {
	let app: INestApplication;
	let configService: ConfigService;
	let jwtService: JwtService;
	let postgresService: PostgresService;
	let seederService: SeederService;
	let usersService: UsersService;

	let users: User[];

	beforeAll(async () => {
		const moduleFixture = await Test.createTestingModule({
			imports: [AuthModule, ConfigModule, ResetPasswordModule, PostgresModule, SeederModule, SessionModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		configService = moduleFixture.get<ConfigService>(ConfigService);
		jwtService = moduleFixture.get<JwtService>(JwtService);
		postgresService = moduleFixture.get<PostgresService>(PostgresService);
		seederService = moduleFixture.get<SeederService>(SeederService);
		usersService = moduleFixture.get<UsersService>(UsersService);

		app.useGlobalPipes(new ValidationPipe({ transform: true }));

		await app.init();
	});

	beforeAll(async () => {
		users = await seederService.createUsers(1, Role.USER);
	});

	afterAll(async () => {
		await postgresService.reset();
		await app.close();
	});

	it('should send a password reset email to a user', async () => {
		const payload: SendResetPasswordEmailDto = { email: users.at(0).email };
		const response = await request(app.getHttpServer()).post('/reset-password').send(payload);

		expect(response.status).toEqual(HttpStatus.NO_CONTENT);
	});

	it('should not send a password reset email to an unknown user', async () => {
		const payload: SendResetPasswordEmailDto = {
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
		};
		const response = await request(app.getHttpServer()).post('/reset-password').send(payload);

		expect(response.status).toEqual(HttpStatus.NO_CONTENT);
	});

	it('should not send a password reset email to a user when the payload is invalid', async () => {
		const payload = {};
		const response = await request(app.getHttpServer()).post('/reset-password').send(payload);

		expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
	});

	it("should reset a user's password", async () => {
		const payload: ResetPasswordDto = { password: faker.internet.password(8) };
		const jwtPayload: ResetPasswordTokenPayloadType = { email: users.at(0).email };
		const dbUser = await usersService.getByEmail(jwtPayload.email);
		const token = await jwtService.signAsync(jwtPayload, {
			secret: `${configService.get<string>('api.reset-password.jwtSecret')}${dbUser.password}`,
			expiresIn: configService.get<string>('api.reset-password.jwtExpirationTime'),
		});
		const response = await request(app.getHttpServer()).post(`/reset-password/reset/${token}`).send(payload);

		expect(response.status).toEqual(HttpStatus.NO_CONTENT);
	});

	it('should not reset the password of a user with an invalid token', async () => {
		const payload: ResetPasswordDto = { password: faker.internet.password(8) };
		const jwtPayload: ResetPasswordTokenPayloadType = { email: users.at(0).email };
		const dbUser = await usersService.getByEmail(jwtPayload.email);
		const token = await jwtService.signAsync(jwtPayload, {
			secret: `${configService.get<string>('api.reset-password.jwtSecret')}${dbUser.password}`,
			expiresIn: configService.get<string>('api.reset-password.jwtExpirationTime'),
		});
		const response = await request(app.getHttpServer())
			.post(`/reset-password/reset/${token.slice(0, -1)}`)
			.send(payload);

		expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
	});

	it('should not reset the password of a user with an expired token', async () => {
		const payload: ResetPasswordDto = { password: faker.internet.password(8) };
		const jwtPayload: ResetPasswordTokenPayloadType = { email: users.at(0).email };
		const dbUser = await usersService.getByEmail(jwtPayload.email);
		const token = await jwtService.signAsync(jwtPayload, {
			secret: `${configService.get<string>('api.reset-password.jwtSecret')}${dbUser.password}`,
			expiresIn: '0s',
		});
		const response = await request(app.getHttpServer()).post(`/reset-password/reset/${token}`).send(payload);

		expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
	});

	it('should not reset the password of an unknown user', async () => {
		const payload: ResetPasswordDto = { password: faker.internet.password(8) };
		const jwtPayload: ResetPasswordTokenPayloadType = {
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
		};
		const token = await jwtService.signAsync(jwtPayload, {
			secret: `${configService.get<string>('api.reset-password.jwtSecret')}`,
			expiresIn: configService.get<string>('api.reset-password.jwtExpirationTime'),
		});
		const response = await request(app.getHttpServer()).post(`/reset-password/reset/${token}`).send(payload);

		expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
	});

	it('should not reset the password of a user when the request is invalid', async () => {
		const payload = {};
		const jwtPayload: ResetPasswordTokenPayloadType = {
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
		};
		const token = await jwtService.signAsync(jwtPayload, {
			secret: `${configService.get<string>('api.reset-password.jwtSecret')}`,
			expiresIn: configService.get<string>('api.reset-password.jwtExpirationTime'),
		});
		const response = await request(app.getHttpServer()).post(`/reset-password/reset/${token}`).send(payload);

		expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
	});
});
