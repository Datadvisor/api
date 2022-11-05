import { faker } from '@faker-js/faker/locale/en';
import { createMock } from '@golevelup/ts-jest';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { EmailService } from '../email/email.service';
import { ContactService } from './contact.service';
import { SendContactEmailDto } from './dto/send-contact-email.dto';

describe('ContactService', () => {
	let contactService: ContactService;
	let emailService: EmailService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ContactService,
				{
					provide: ConfigService,
					useValue: {
						get(key: string) {
							const env = {
								'api.contact.emailTemplatePath': 'views/contact-email.view.ejs',
								'api.email.senderName': 'Datadvisor',
								'api.email.senderEmail': 'noreply@datadvisor.me',
								'api.contact.recipientEmail': 'demo@datadvisor.me',
							};

							return env[key];
						},
					},
				},
			],
		})
			.useMocker(createMock)
			.compile();

		contactService = module.get<ContactService>(ContactService);
		emailService = module.get<EmailService>(EmailService);
	});

	it('should be defined', () => {
		expect(contactService).toBeInstanceOf(ContactService);
		expect(contactService).toBeDefined();
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

		emailService.send = jest.fn().mockResolvedValue({});
		await expect(contactService.send(payload)).resolves.toBe(undefined);
	});
});
