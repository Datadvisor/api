import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { SendContactEmailDto } from './dto';

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
			lastName: 'Doe',
			firstName: 'John',
			company: 'Datadvisor',
			email: 'john@datadvisor.me',
			phone: '+33612345678',
			subject: 'Partnership',
			message: 'Hello, I want to discuss with you about a potential partnership?',
		};

		contactService.send = jest.fn().mockResolvedValue({});
		await expect(contactController.send(payload)).resolves.toBe(undefined);
	});
});
