import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { createMock } from '@golevelup/ts-jest';

import { ContactService } from './contact.service';
import { EmailService } from '../email';
import { SendContactEmailDto } from './dto';

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
			lastName: 'Doe',
			firstName: 'John',
			company: 'Datadvisor',
			email: 'john@datadvisor.me',
			phone: '+33612345678',
			subject: 'Partnership',
			message: 'Hello, I want to discuss with you about a potential partnership?',
		};

		emailService.send = jest.fn().mockResolvedValue({});
		await expect(contactService.send(payload)).resolves.toBe(undefined);
	});
});
