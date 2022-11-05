import { faker } from '@faker-js/faker/locale/en';
import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { SendContactEmailDto } from './dto/send-contact-email.dto';

describe('ContactController', () => {
	let contactController: ContactController;
	let contactService: ContactService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ContactController],
			providers: [ContactService],
		})
			.useMocker(createMock)
			.compile();

		contactController = module.get<ContactController>(ContactController);
		contactService = module.get<ContactService>(ContactService);
	});

	it('should be defined', () => {
		expect(contactController).toBeInstanceOf(ContactController);
		expect(contactController).toBeDefined();
	});

	it('should send a contact email', async () => {
		const payload: SendContactEmailDto = {
			lastName: faker.name.lastName(),
			firstName: faker.name.firstName(),
			company: faker.company.name(),
			email: faker.internet.email(undefined, undefined, 'datadvisor.me'),
			phone: faker.phone.number(),
			subject: faker.lorem.text(),
			message: faker.lorem.sentences(),
		};

		contactService.send = jest.fn().mockResolvedValue({});
		await expect(contactController.send(payload)).resolves.toBe(undefined);
	});
});
