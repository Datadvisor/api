import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { faker } from '@faker-js/faker/locale/en';

import { ConfigModule } from '../../src/config';
import { ContactModule } from '../../src/contact';
import { SendContactEmailDto } from '../../src/contact/dto';

describe('Contact', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleFixture = await Test.createTestingModule({
			imports: [ConfigModule, ContactModule],
		}).compile();

		app = moduleFixture.createNestApplication();

		app.useGlobalPipes(new ValidationPipe({ transform: true }));

		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it('should send a contact email', async () => {
		const payload: SendContactEmailDto = {
			lastName: faker.name.lastName(),
			firstName: faker.name.firstName(),
			company: faker.company.name(),
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
			phone: faker.phone.number('+33 6 ## ## ## ##'),
			subject: faker.lorem.text(),
			message: faker.lorem.sentences(),
		};
		const response = await request(app.getHttpServer()).post('/contact').send(payload);

		expect(response.status).toEqual(HttpStatus.NO_CONTENT);
	});

	it('should not send a contact email when the payload is invalid', async () => {
		const payload = {
			lastName: faker.name.lastName(),
			firstName: faker.name.firstName(),
			company: faker.company.name(),
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
			phone: faker.phone.number(),
			subject: faker.lorem.text(),
		};
		const response = await request(app.getHttpServer()).post('/contact').send(payload);

		expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
	});
});
